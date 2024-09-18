import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comments.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;
  try {
    const comment = new Comment({
      content,
      video: videoId,
      owner: req.user?._id,
    });
    if (!comment) {
      throw new ApiError(400, "enter the comment");
    }
    const createdComment = await comment.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, createdComment, "Comment added succesfull"));
  } catch (error) {
    throw new ApiError(500, "Error while adding comment");
  }
});
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const comments = await Comment.aggregatePaginate(
      [
        {
          $match: { video: new mongoose.Types.ObjectId(videoId) },
        },
      ],
      { limit, page }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments fetched Successfully"));
  } catch (error) {
    throw new ApiError(400, "Failed to fetch the Comments of Video");
  }
});
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //  checking if the comming commentId is valid or not
  // if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
  //   return res.status(400).json(new ApiResponse(400, {}, "Invalid comment ID"));
  // }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted succesfully"));
});
const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    new ApiError(400, "content field is required");
  }
  const comment = await Comment.findByIdAndUpdate(
    req.params.commentId,
    { $set: { content: content } },
    { new: true }
  );
  console.log(comment);
  return res
    .status(200)
    .json(new ApiResponse(400, comment, "comment updated successfully"));
});

export { addComment, deleteComment, getVideoComments, updateComment };
