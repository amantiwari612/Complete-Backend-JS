import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  try {
    const playlist = new Playlist({
      name,
      description,
      videos: [],
      owner: req.user._id,
    });
    if (!playlist) {
      throw new ApiError(400, "name and description field are required");
    }
    const createdPlaylist = await playlist.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(
        new ApiResponse(200, createdPlaylist, "PlayList Created Successfully")
      );
  } catch (error) {
    throw new ApiError(400, "Failed to create PlayList");
  }
});
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  try {
    const playlist = await Playlist.findById(playlistId)
      .populate("videos", { _id: 1 })
      .populate("owner", "username fullname avatar");
    if (!playlist) {
      throw new ApiError(400, "Unable to get the Playlist");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, playlist, "Playlist fetched by the provided Id")
      );
  } catch (error) {}
});
const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const playlist = await Playlist.find({ owner: userId })
    .populate("videos", { _id: 0 })
    .populate("owner", "username fullname avatar");

  if (!playlist) {
    throw new ApiError(404, "No user playlist found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "User playlists fetched successfully")
    );
});
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playList id");
  }
  try {
    await Playlist.findByIdAndDelete(playlistId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "PlayList Deleted Successfully"));
  } catch (error) {
    throw new ApiError(404, "Failed to delete the Playlist");
  }
});
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  const userId = req.user?._id;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid PlaylistId");
  }
  try {
    const playlist = await Playlist.findByIdAndUpdate(
      { _id: playlistId, owner: userId },
      { $set: { name, description } },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "playList updated succesfully"));
  } catch (error) {}
});
const addVideoInPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist ID or video ID");
  }
  const existedVideos = await Playlist.findOne({
    $or: [{ videos: videoId }],
  });
  if (existedVideos) {
    throw new ApiError(400, "Video already exists in the playlist");
  }

  try {
    const playlist = await Playlist.findByIdAndUpdate(
      { _id: playlistId, owner: userId }, //ensure the ownership
      { $push: { videos: videoId } },
      { new: true }
    );
    if (!playlist) {
      return res
        .status(404)
        .json({ message: "Playlist not found or you do not have permission." });
    }
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "video added to playlist!"));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Can't add video to the playlist");
  }
});
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist ID or video ID");
  }
  const existedVideos = await Playlist.findOne({
    $or: [{ videos: videoId }],
  });
  if (!existedVideos) {
    throw new ApiError(400, "This Video Id doesn't exists");
  }

  try {
    const playlist = await Playlist.findOneAndUpdate(
      {
        _id: playlistId,
        owner: userId,
      },
      {
        $pull: { videos: videoId },
      },
      {
        new: true,
      }
    );
    if (!playlist) {
      return res
        .status(404)
        .json({ message: "Playlist not found or you do not have permission." });
    }
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "video removed from playlist"));
  } catch (error) {
    throw new ApiError(400, "Unable to remove the video from playlist");
  }
});
export {
  createPlaylist,
  getPlaylistById,
  getUserPlaylist,
  deletePlaylist,
  updatePlaylist,
  addVideoInPlaylist,
  removeVideoFromPlaylist,
};
