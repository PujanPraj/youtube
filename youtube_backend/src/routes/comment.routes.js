import { Router } from "express";
import {
  addComment,
  updateComment,
  deleteComment,
  getVideoComments,
} from "../controllers/comment.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = Router();

router
  .route("/:videoId")
  .post(authMiddleware, addComment)
  .get(authMiddleware, getVideoComments);

router
  .route("/c/:commentId")
  .put(authMiddleware, updateComment)
  .delete(authMiddleware, deleteComment);

export default router;
