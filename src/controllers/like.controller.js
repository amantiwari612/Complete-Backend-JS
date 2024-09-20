import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/likes.model.js";
const toogleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(404, "invalid commentId");
  }

  try {
    const existingLike = await Like.findOne({
      comment: commentId,
      likedBy: req.user?._id,
    });
    if (existingLike) {
      const unlike = await Like.findByIdAndDelete(existingLike._id);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "comment unliked succesfully"));
    } else {
      const like = new Like({ comment: commentId, likedBy: req.user?._id });
      const likecomment = await like.save({ validateBeforeSave: false });
      return res
        .status(200)
        .json(new ApiResponse(200, likecomment, "comment liked succesfully"));
    }
  } catch (error) {
    throw new ApiError(500, "error while toggle commendId");
  }
});
const toogleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "invalid commentId");
  }
  try {
    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: userId,
    });
    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "video unliked successfully"));
    } else {
      const like = new Like({ video: videoId, likedBy: userId });
      const liked = await like.save({ validateBeforeSave: false });
      return res
        .status(200)
        .json(new ApiResponse(200, liked, "video liked succesfully"));
    }
  } catch (error) {
    throw new ApiError(500, "error while toggle commendId");
  }
});

const toogleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(404, "invalid tweetId");
  }
  try {
    const existingLike = await Like.findOne({
      tweet: tweetId,
      likedBy: userId,
    });
    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "tweet unliked successfully"));
    } else {
      const like = new Like({
        tweet: tweetId,
        likedBy: userId,
      });
      const liked = await like.save({ validateBeforeSave: false });
      return res
        .status(200)
        .json(new ApiResponse(200, liked, "tweet liked succesfully"));
    }
  } catch (error) {
    throw new ApiError(500, "error while toggle tweetId");
  }
});
const getLikedVideo = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    { $match: { likedBy: req.user?._id, video: { $exists: true } } },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails",
    },
    {
      $project: {
        _id: 1,
        video: {
          _id: "$videoDetails._id",
          title: "$videoDetails.title",
          videoFile: "$videoDetails.videoFile",
          thumbnail: "$videoDetails.thumbnail",
          description: "$videoDetails.description",
          views: "$videoDetails.views",
        },
      },
    },
  ]);
  if (!likedVideos) {
    throw new ApiError(400, "there is no liked videos");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched succesfully")
    );
});

export { toogleCommentLike, toogleTweetLike, toogleVideoLike, getLikedVideo };
