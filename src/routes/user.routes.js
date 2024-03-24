import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  updateCurrentUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
  userChannelProfile,
  getUserWatchHistory,
} from "../controllers/user.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refreshAccessToken").get(refreshAccessToken);

router.route("/changePassword").post(verifyJWT, changePassword);

router.route("/updateUserDetails").patch(verifyJWT, updateCurrentUserDetails);

router
  .route("/updateAvatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
  .route("/updateCoverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/profile/:username").get(verifyJWT, userChannelProfile);

router.route("/watchHistory").get(verifyJWT, getUserWatchHistory);

export default router;
