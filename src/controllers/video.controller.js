import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publistAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user?._id;

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

  const vid = new Video({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    owner: userId,
    duration: videoFile.duration,
  });
  const video = await vid.save({ validateBeforeSave: false });
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
// const getAllVideos = asyncHandler(async (req, res) => {
//   const videos = await Video.find();

//   if (!videos || videos.length === 0) {
//     return res.status(404).json(new ApiResponse(404, null, "No videos found"));
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, videos, "Videos fetched successfully"));
// });
// TODO: only the value comes from req.body should only updated
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
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  // validate and set sortBy and sorttype
  // filter userId if provided
  // using aggregate pipeling-
  // 1.match, 2.sortby validated field, 3.pagination(sort,limit ) 4.project specific filed
  // count total no of videos to match the filter
  const sortByField = ["createdAt", "duration", "views"];
  const sortTypeArr = ["asc", "desc"];

  const validSortBy = sortByField.includes(sortBy) ? sortBy : "createdAt";
  const validSortType = sortTypeArr.includes(sortType) ? sortType : "desc";
  if (userId && !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }
  try {
    let queryString = query ? query.toString() : "";
    let filterCondition = {
      $or: [
        {
          title: { $regex: queryString, $options: "i" },
        },
        {
          description: { $regex: queryString, $options: "i" },
        },
      ],
    };

    const videos = await Video.aggregate([
      {
        $match: {
          owner: userId ? new mongoose.Types.ObjectId(userId) : null,
          ...filterCondition,
        },
      },
      {
        $sort: {
          [validSortBy]: validSortType === "desc" ? -1 : 1,
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit, 10) },
      {
        $project: {
          title: 1,
          description: 1,
          thumbnail: 1,
          views: 1,
          createdAt: 1,
          duration: 1,
          owner: 1,
        },
      },
    ]);

    const totalVideos = await Video.countDocuments(filterCondition);
    // alternate for total videos
    // const totalVideos = await videos.length();
    res.status(200).json({
      limit,
      success: true,
      totalVideos,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalVideos / limit),
      videos,
    });
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Something went wrong while fetching the videos!");
  }
});
export { publistAVideo, deleteVideo, getVideoById, getAllVideos, updateVideo };
