import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subcriptions.model.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const channelId = req.user?._id;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channel Id");
  }
  const user = await User.findById(channelId);

  if (!user) {
    throw new ApiError(400, "channel Not found");
  }

  const subsribersCount = await Subscription.countDocuments({
    channel: channelId,
  });
  const channelsSubscribedToCount = await Subscription.countDocuments({
    subscriber: channelId,
  });
  const video = await Video.aggregate([
    {
      $match: {
        owner: channelId ? new mongoose.Types.ObjectId(channelId) : null,
      },
    },

    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "videoLike",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
        totalLikes: { $sum: { $size: "$videoLike" } },
        totalComments: { $sum: { $size: "$comments" } },
      },
    },
    {
      $project: {
        _id: 0,
        totalComments: 1,
        totalVideos: 1,
        totalViews: 1,
        totalLikes: 1,
      },
    },
  ]);
  const channelStats = {
    subscribersCount: subsribersCount || 0,
    SubscribedToCount: channelsSubscribedToCount || 0,
    totalVideos: video[0]?.totalVideos || 0,
    totalViews: video[0]?.totalViews || 0,
    totalLikes: video[0]?.totalLikes || 0,
    totalComments: video[0]?.totalComments || 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "User stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const channelId = req.user?._id;
  try {
    const videos = await Video.find({
      owner: channelId,
      isPublished: true,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, videos, "channel videos fetched successfully")
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      "something went wrong while getting channels videos!"
    );
  }
});
export { getChannelStats, getChannelVideos };
