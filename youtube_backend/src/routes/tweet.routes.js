import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  getUserTweet,
  getAllTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controllers.js";
const router = Router();

router.route("/").get(getAllTweets).post(authMiddleware, createTweet);

router
  .route("/t/:tweetId")
  .put(authMiddleware, updateTweet)
  .delete(authMiddleware, deleteTweet);

router.route("/user/:userId").get(authMiddleware, getUserTweet);

export default router;
