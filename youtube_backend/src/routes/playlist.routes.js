import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(authMiddleware, createPlaylist);

router
  .route("/:playlistId")
  .get(authMiddleware, getPlaylistById)
  .put(authMiddleware, updatePlaylist)
  .delete(authMiddleware, deletePlaylist);

router
  .route("/add/:videoId/:playlistId")
  .put(authMiddleware, addVideoToPlaylist);
router
  .route("/remove/:videoId/:playlistId")
  .put(authMiddleware, removeVideoFromPlaylist);

router.route("/user/:userId").get(authMiddleware, getUserPlaylists);

export default router;
