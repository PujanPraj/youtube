import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
} from "../controllers/like.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/toggle/v/:videoId").post(authMiddleware, toggleVideoLike);
router.route("/toggle/c/:commentId").post(authMiddleware, toggleCommentLike);
router.route("/toggle/t/:tweetId").post(authMiddleware, toggleTweetLike);
router.route("/videos").get(authMiddleware, getLikedVideos);

export default router;
