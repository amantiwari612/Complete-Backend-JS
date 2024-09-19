import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweets.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user?._id;
  console.log(userId);

  try {
    const tweet = new Tweet({
      content,
      owner: req.user._id,
    });
    if (!tweet) {
      throw new ApiError("enter the content for the tweet");
    }
    const createtweet = await tweet.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, createtweet, "tweet created successfully"));
  } catch (error) {
    throw new ApiError(400, "unable to create tweet");
  }
});
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(404, "Invalid tweet id");
  }
  const tweet = await Tweet.findByIdAndDelete(tweetId);
  if (!tweet) {
    throw new ApiError(400, "tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet deleted successfully"));
});
const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.params;
  const { tweetId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "invalid User");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { $set: { content } },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet updated succesfully"));
});
const getUserTweet = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(404, "user not found");
  }
  const userTweet = await Tweet.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    { $sort: { createdAt: -1 } },
  ]);
  if (!userTweet) {
    throw new ApiError(400, "no tweet found for this user");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, userTweet, "fetched the Tweet for the given User")
    );
});

export { createTweet, deleteTweet, getUserTweet, updateTweet };
