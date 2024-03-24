import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessToken, generateRefreshToken } from "../services/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshtokens = async (userId) => {
  try {
    const existingUser = await User.findById(userId);
    const accessToken = await generateAccessToken(
      existingUser._id,
      existingUser.username,
      existingUser.hashPassword
    );
    const refreshToken = await generateRefreshToken(existingUser._id);

    existingUser.refreshToken = refreshToken;
    await existingUser.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrors(500, {}, "something went wrong!");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;
  if (!username || !fullName || !email || !password)
    throw new ApiErrors(400, "All fields are required");
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiErrors(400, "username or email already exists");
  }

  const avatarLocalPath = req.files.avatar[0].path;
  if (!avatarLocalPath) {
    throw new ApiErrors(400, "Avatar is required");
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiErrors(400, "Avatar is required");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const createdUser = await User.create({
    username,
    fullName,
    email,
    hashPassword,
    avatar: avatar.url || "",
    coverImage: coverImage?.url || "",
  });
  //const created_User = User.findById(createdUser._id).select("-password -refreshToken")
  if (!createdUser) {
    throw new ApiErrors(500, "error while registering user");
  } else {
    const responseUser = createdUser.toObject();
    delete responseUser.hashPassword;
    delete responseUser.watchHistory;
    res
      .status(201)
      .send(new ApiResponse(200, responseUser, "user register successfully"));
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!(username || password))
      throw new ApiErrors(400, {}, "username or password is required");
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      throw new ApiErrors(404, {}, "account not exist");
    }
    //const isPasswordValid = await existingUser.isPasswordCorrect(password);
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.hashPassword
    );
    if (!isPasswordValid) {
      throw new ApiErrors(400, {}, "password is wrong");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshtokens(
      existingUser._id
    );
    const decodedAccessToken = decodeURIComponent(accessToken);
    const decodedRefreshToken = decodeURIComponent(refreshToken);

    const user = existingUser.toObject();
    delete user.hashPassword;
    delete user.refreshToken;

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", decodedAccessToken, options)
      .cookie("refreshToken", decodedRefreshToken, options)
      .send(new ApiResponse(200, user, "you logged in successfully"));
  } catch (error) {
    console.error("error login user", error);
    res.send(new ApiErrors(500, {}, "internal server error"));
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "you log out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body;
  if (!incomingRefreshToken)
    return res.send(new ApiErrors(401, {}, "unauthorized access"));
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const existingUser = await User.findById(decodedToken.user_id);
    if (!existingUser) return res.send(new ApiErrors(400, {}, "invalid token"));
    if (incomingRefreshToken !== existingUser.refreshToken) {
      return res.send(
        new ApiErrors(400, {}, "refresh token is expired or used")
      );
    }
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshtokens(existingUser._id);
    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .send(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "your token is refreshed successfully!!"
        )
      );
  } catch (error) {
    res.send(new ApiErrors(400, error?.message || "invalid refresh token"));
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!(oldPassword || newPassword || confirmPassword))
    throw new ApiErrors(400, {}, "please give all requirments...");
  const user = await User.findById(req.user._id);
  if (!user) return new ApiErrors(400, {}, "user not found");
  const isMatch = await bcrypt.compare(oldPassword, user.hashPassword);
  if (!isMatch) return new ApiErrors(400, {}, "incorrect old password");
  if (newPassword !== confirmPassword) {
    throw new ApiErrors(400, {}, "password does not match");
  }
  const newHashedPassword = await bcrypt.hash(newPassword, 10);
  user.hashPassword = newHashedPassword;
  await user.save({ validateBeforeSave: false });
  res.send(new ApiResponse(200, {}, "password changed successfully"));
});

const updateCurrentUserDetails = asyncHandler(async (req, res) => {
  const { username, email, fullName } = req.body;
  if (!(username || email || fullName))
    return new ApiErrors(400, {}, "All fields are required");
  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      username,
      email,
      fullName,
    },
  });
  if (!user) return new ApiErrors(400, {}, "user not found");

  await user.save({ validateBeforeSave: false });
  res.send(new ApiResponse(200, {}, "details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) return new ApiErrors(400, {}, "avatar file is missing");
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url)
    return new ApiErrors(400, {}, "error while uploading in cloudinary");
  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      avatar: avatar.url,
    },
  }).select("-hashPassword,-refreshToken");
  res.send(new ApiResponse(200, user, "avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath)
    return new ApiErrors(400, {}, "coverImage file is missing");
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url)
    return new ApiErrors(
      400,
      {},
      "error while updating coverImage on cloudinary"
    );
  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      coverImage: coverImage.url,
    },
  }).select("-hashPassword,-refreshToken");
  res.send(new ApiResponse(200, user, "coverImage updated successfully"));
});

const userChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return new ApiErrors(400, {}, "username is missing");
  const channel = await User.aggregate([
    {
      $match: {
        username: username,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);
  if (!channel?.length) return new ApiErrors(404, {}, "channel not found");

  res.send(
    new ApiResponse(200, channel[0], "user channel fetched successfully")
  );
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  res.send(
    new ApiResponse(
      200,
      user[0].watchHistory,
      "watchHistory fetched successfully"
    )
  );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  updateCurrentUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
  userChannelProfile,
  getUserWatchHistory,
};
