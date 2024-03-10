import { Router } from "express";
import {
  publishAVideo,
  getAllVideos,
  updateAVideo,
  deleteAVideo,
  togglePublishStatus,
  getAVideo,
} from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = Router();

router
  .route("/")
  .get(getAllVideos)
  .post(
    authMiddleware,
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

router
  .route("/:videoId")
  .get(getAVideo)
  .put(togglePublishStatus)
  .put(upload.single("thumbnail"), updateAVideo);

router.route("/:videoId").delete(deleteAVideo);

export default router;
