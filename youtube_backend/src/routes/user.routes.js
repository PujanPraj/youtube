import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserById,
  updateUser,
  updatePassword,
  updateAvatar,
  refreshAccessToken,
  deleteUser,
  updateCoverImg,
  getChannelProfile,
  getWatchHistory,
} from "../controllers/user.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/registerUser").post(registerUser);
router.route("/loginUser").post(loginUser);
router.route("/logoutUser").post(authMiddleware, logoutUser);
router.route("/refresh").post(refreshAccessToken);

router.route("/updateUser").put(authMiddleware, updateUser);
router.route("/updatePassword").put(authMiddleware, updatePassword);
router.route("/updateAvatar").put(authMiddleware, updateAvatar);
router.route("/updateCoverImg").put(authMiddleware, updateCoverImg);

router.route("/me").get(authMiddleware, getUserById);
router.route("/channel/:username").get(authMiddleware, getChannelProfile);
router.route("/getWatchHistory").get(authMiddleware, getWatchHistory);

router.route("/deleteUser").delete(authMiddleware, deleteUser);

export default router;
