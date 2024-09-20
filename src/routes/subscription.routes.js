import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  toggleSubscription,
  getUserChannelSubscribers,
} from "../controllers/subscription.controller.js";
const router = Router();
router.use(verifyJWT);
router
  .route("/:channelId")
  .post(toggleSubscription)
  .get(getUserChannelSubscribers);
router.route("/u/subscribedchannels").get(getSubscribedChannels);
export default router;
