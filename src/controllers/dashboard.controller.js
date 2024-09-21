import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { page = 1, limit = 10 } = req.params;
  const channelId = req.user?._id;
  try {
    const videos = await Video.find({ owner: channelId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res
      .json(200)
      .json(
        new ApiResponse(200, videos, "channel videos fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      400,
      "something went wrong while getting channels videos!"
    );
  }
});
export { getChannelStats, getChannelVideos };
