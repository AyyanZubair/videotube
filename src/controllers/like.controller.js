import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/likes.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/videos.models.js"

const addLikeOnVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      return res.status(400).json(new ApiErrors(400, {}, "Video ID is required"));
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(400).json(new ApiErrors(400, {}, "Video not found"));
    }

    const existingLike = await Like.findById({ videoId })
    if (!existingLike) {
      await LikesModel.create({
        likes: 1,
        video: videoId,
        likedBy: [req.user._id]
      })
    } else {
      const alreadyLike = existingLike.likedBy.includes(req.user._id);
      if (alreadyLike) {
        return res.send(new ApiErrors(400, {}, "already liked"))
      } else {
        await LikesModel.findOneAndUpdate({
          _id: existingLike
        }, {
          $inc: {
            likes: 1
          },
          video: videoId,
          $push: {
            likedBy: [req.user._id]
          }
        })
      }
    }
    res.send(new ApiResponse(200, "Like Added Successfully!!"))

  } catch (error) {
    console.log("Error while adding like on video", error);
    res.status(500).json(new ApiErrors(500, {}, "Internal server error"));
  }
});

const addLikeOnComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!commentId) return new ApiErrors(400, {}, "id is required");
    const existingLike = await Like.findById({ commentId })
    if (!existingLike) {
      await LikesModel.create({
        likes: 1,
        comment: commentId,
        likedBy: [req.user._id]
      })
    } else {
      const alreadyLike = existingLike.likedBy.includes(req.user._id);
      if (alreadyLike) {
        return res.send(new ApiErrors(400, {}, "already liked"))
      } else {
        await LikesModel.findOneAndUpdate({
          _id: existingLike
        }, {
          $inc: {
            likes: 1
          },
          comment: commentId,
          $push: {
            likedBy: [req.user._id]
          }
        })
      }
    }
    res.send(new ApiResponse(200, "Like Added Successfully!!"))
  } catch (error) {
    console.log("error while adding like on comment", error);
    res.status(500).send(500, {}, "internal server error");
  }
});

const addLikeOnTweet = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;
    if (!tweetId) return new ApiErrors(400, {}, "id is required");
    const existingLike = await Like.findById({ tweetId })
    if (!existingLike) {
      await LikesModel.create({
        likes: 1,
        tweet: tweetId,
        likedBy: [req.user._id]
      })
    } else {
      const alreadyLike = existingLike.likedBy.includes(req.user._id);
      if (alreadyLike) {
        return res.send(new ApiErrors(400, {}, "already liked"))
      } else {
        await LikesModel.findOneAndUpdate({
          _id: existingLike
        }, {
          $inc: {
            likes: 1
          },
          tweet: tweetId,
          $push: {
            likedBy: [req.user._id]
          }
        })
      }
    }
    res.send(new ApiResponse(200, "Like Added Successfully!!"))
  } catch (error) {
    console.log("error while adding like on tweet", error);
    res.status(500).send(500, {}, "internal server error");
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userLikedVideos = Like.aggregate([
    {
      $match: {
        likedBy: req.user._id
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "videoOwner"
            }
          }
        ]
      }
    }
  ])

  res.send(new ApiResponse(200, userLikedVideos[0], "all your liked videos are here"))
})

export { addLikeOnVideo, addLikeOnComment, addLikeOnTweet, getLikedVideos };
