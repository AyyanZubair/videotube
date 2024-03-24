import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comments.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/videos.models.js";
import { User } from "../models/users.model.js";

const addComment = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return new ApiErrors(400, {}, "content is required");
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) return new ApiErrors(400, {}, "video is not available");
    const userId = await User.findById(req.user._id);
    if (!userId) return new ApiErrors(400, {}, "user not exist");
    const comment = await Comment.create({
      content,
      video: videoId,
      owner: userId,
    });
    res.send(new ApiResponse(200, comment, "comment added successfully"));
  } catch (error) {
    console.log("error while adding comment", error);
    res.status(500).send(new ApiErrors(500, {}, "internal server error"));
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!commentId)
      return new ApiErrors(
        400,
        {},
        "commentId is required to delete the comment"
      );
    await Comment.findByIdAndDelete(commentId);
    res.send(new ApiResponse(200, {}, "comment deleted successfully"));
  } catch (error) {
    console.log("error while deleting comment", error);
    res.status(500).send(new ApiErrors(500, {}, "internal server error"));
  }
});

const updateComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    const { updatedContent } = req.body;
    if (!(commentId || updatedContent))
      return new ApiErrors(400, {}, "commentId or updatedContent is required");
    await Comment.findByIdAndUpdate(
      { _id: commentId },
      {
        $set: {
          content: updatedContent,
        },
      }
    );
    res.send(new ApiResponse(200, {}, "comment updated successfully"));
  } catch (error) {
    console.log("error while updating the comment", error);
    res.status(500).send(new ApiErrors(500, {}, "internal server error"));
  }
});

const getVideoComments = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) return new ApiErrors(400, {}, "videoId is required");
    const video = await Video.findById(videoId);
    if (!video) return new ApiErrors(400, {}, "video not published");
    const allComments = await Comment.find({ video: videoId });
    res.send(new ApiResponse(200, allComments, "comments of video are here"));
  } catch (error) {
    console.log("error which getting comments", error);
    res.status(500).send(new ApiErrors(500, {}, "internal server error"));
  }
});

export { addComment, deleteComment, updateComment, getVideoComments };
