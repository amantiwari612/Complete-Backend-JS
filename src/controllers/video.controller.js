import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publistAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // get the video,upload to cloudinary,create video
  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "VideoFile is required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!videoFile) {
    throw new ApiError(400, "VideoFile is required");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration,
  });
  const createdVideo = await Video.findById(video._id).select(
    "-password -refreshToken"
  );
  if (!createdVideo) {
    throw new ApiError(400, "something went wrong while uploading video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, createdVideo, "Video Upload successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findByIdAndDelete(req.params.videoId);
  if (!video) {
    throw new ApiError(400, "video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted succesfully"));
});
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(req.params.videoId);
  if (!video) {
    throw new ApiError(200, "video not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        "user fetched succesfully with the following id"
      )
    );
});
const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find();

  if (!videos || videos.length === 0) {
    return res.status(404).json(new ApiResponse(404, null, "No videos found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});
// TODO: only the value comes from rea.body should only updated
// complete

const updateVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // a seperate fields for handling the req.body data
  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

  const thumbnailLocalPath = req.file?.path;

  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    updateFields.thumbnail = thumbnail.url;
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No fields to update");
  }
  const video = await Video.findByIdAndUpdate(
    req.params.videoId,
    {
      $set: updateFields,
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Updated Successfully"));
});

// unused method to handle the pulished status of the video
const tooglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});
export { publistAVideo, deleteVideo, getVideoById, getAllVideos, updateVideo };
