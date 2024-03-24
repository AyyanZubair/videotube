import { Video } from "../models/videos.models.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishVideo = asyncHandler(async (req, res) => {
  try {
    const { title, discription } = req.body;
    if (!(title || discription))
      return new ApiErrors(400, {}, "all fields are required");

    const videoLocalPath = req.files?.video[0].path;
    if (!videoLocalPath) return new ApiErrors(400, {}, "video is missing");
    const video = await uploadOnCloudinary(videoLocalPath);

    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if (!thumbnailLocalPath)
      return new ApiErrors(400, {}, "thumbnail is missing");
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!(video || thumbnail))
      return new ApiErrors(
        400,
        {},
        "error while uploading video or thumbnail on cloudinary"
      );
    const user_id = req.user._id;
    const videoData = await Video.create({
      user_id,
      title,
      discription,
      thumbnail: thumbnail?.url,
      videoFile: video?.url,
    });
    res.send(new ApiResponse(200, videoData, "video published successfully"));
  } catch (error) {
    console.log("error while publish video", error);
    res.send(new ApiErrors(400, {}, "internal server error"));
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId)
      return new ApiErrors(400, {}, "videoId is required to fetch the video");
    const video = await Video.findById(videoId);
    if (!video)
      return new ApiErrors(400, {}, "video which you want does not exist");
    res.send(new ApiResponse(200, video, "video fetched successfully"));
  } catch (error) {
    console.log("error while fetched the video", error);
    res.send(new ApiResponse(500, {}, "internal server error"));
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { updatedTitle, updatedDiscription } = req.body;
    const updatedThumbnailLocalPath = req.file?.path;
    if (!videoId)
      return new ApiErrors(400, {}, "videoId is required to update video");
    if (!updatedThumbnailLocalPath)
      return new ApiErrors(400, {}, "thumbnail is required");
    const updatedThumbnail = await uploadOnCloudinary(
      updatedThumbnailLocalPath
    );
    if (!updatedThumbnail)
      return new ApiErrors(
        400,
        {},
        "something went wrong while uploading on cloudinary"
      );
    const updatedVideo = await Video.findByIdAndUpdate(
      { _id: videoId },
      {
        $set: {
          title: updatedTitle,
          discription: updatedDiscription,
          thumbnail: updatedThumbnail?.url,
        },
      }
    );
    res.send(new ApiResponse(200, updatedVideo, "video updated successfully"));
  } catch (error) {
    console.log("error while updating video details", error);
    res.send(new ApiErrors(500, {}, "internal server error"));
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId)
    return new ApiErrors(400, {}, "videoId is required to delete video");
  await Video.findByIdAndDelete({ _id: videoId });
  res.send(new ApiResponse(200, {}, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId)
    return new ApiErrors(400, {}, "videoId is required to check publish video");
  const video = await Video.findById(videoId);
  if (video) {
    res.send(new ApiResponse(200, video, "published video is here"));
  } else {
    res.status(400).send(new ApiErrors(400, {}, "video not published"));
  }
});

export {
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
