import { Router } from "express";
import {
  getLikedVideo,
  toogleCommentLike,
  toogleTweetLike,
  toogleVideoLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.use(verifyJWT);
router.route("/toggle/c/:commentId").post(toogleCommentLike);
router.route("/toggle/v/:videoId").post(toogleVideoLike);
router.route("/toggle/t/:tweetId").post(toogleTweetLike);
router.route("/videos").get(getLikedVideo);
export default router;
