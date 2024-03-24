import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweets.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.model.js";

const createTweet = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return new ApiErrors(400, {}, "content is required");
    const owner = req.user._id;
    if (!owner) return new ApiErrors(400, {}, "there is no user");
    const tweet = await Tweet.create({
      content,
      owner,
    });
    res.send(new ApiResponse(200, tweet, "tweet created successfully"));
  } catch (error) {
    console.log("error while creating tweet", error);
    res.status(500).send(new ApiErrors(500, {}, "internal server error"));
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;
    if (!tweetId)
      return new ApiErrors(400, {}, "tweetId is required to delete the tweet");
    const tweet = await Tweet.findByIdAndDelete(tweetId);
    if (!tweet)
      return new ApiErrors(
        400,
        {},
        "tweet which you want to delete does not exist"
      );
    res.send(new ApiResponse(200, {}, "tweet deleted successfully"));
  } catch (error) {
    console.log("error while deleting tweet", error);
    res.status(500).send(new ApiErrors(500, {}, "internal server error"));
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;
    const { updatedContent } = req.body;
    if (!tweetId)
      return new ApiErrors(400, {}, "tweetId is required to update the blog");
    const tweet = await Tweet.findByIdAndUpdate(
      { _id: tweetId },
      {
        $set: {
          content: updatedContent,
        },
      }
    );
    res.send(new ApiResponse(200, tweet, "tweet updated successfully"));
  } catch (error) {
    console.log("error while updating the tweet", error);
    res.status(500).send(new ApiErrors(500, {}, "internal server error"));
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return new ApiErrors(
        400,
        {},
        "userId is required to find all tweets of user"
      );
    const user = await User.findById(userId);
    if (!user) return new ApiErrors(400, {}, "you are not logged in");
    const userTweets = await Tweet.find({ owner: userId });
    res.send(
      new ApiResponse(200, userTweets, "your tweets are fetched successfully")
    );
  } catch (error) {
    console.log("error while getting your tweets", error);
    res.status(500).send(new ApiErrors(500, {}, "internal server error"));
  }
});

export { createTweet, deleteTweet, updateTweet, getUserTweets };
