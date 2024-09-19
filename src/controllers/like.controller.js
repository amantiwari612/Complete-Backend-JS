import { asyncHandler } from "../utils/asyncHandler";

const toogleCommentLike = asyncHandler(async (req, res) => {});
const toogleVideoLike = asyncHandler(async (req, res) => {});
const toogleTweetLike = asyncHandler(async (req, res) => {});
const getLikedVideo = asyncHandler(async (req, res) => {});

export { toogleCommentLike, toogleTweetLike, toogleVideoLike, getLikedVideo };
