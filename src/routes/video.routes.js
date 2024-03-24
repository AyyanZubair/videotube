import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getVideoById,
  publishVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
const router = Router();

router.route("/publishVideo").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);

router.route("/getVideo/:videoId").get(verifyJWT, getVideoById);

router
  .route("/updateVideo/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/deleteVideo/:videoId").delete(verifyJWT, deleteVideo);

router.route("/isPublished/:videoId").get(togglePublishStatus);

export default router;
