import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addLikeOnComment,
  addLikeOnTweet,
  addLikeOnVideo,
} from "../controllers/like.controller.js";
const router = Router();

router.route("/likeVideo/:videoId").post(verifyJWT, addLikeOnVideo);

router.route("/likeComment/:commentId").post(verifyJWT, addLikeOnComment);

router.route("/likeTweet/:tweetId").post(verifyJWT, addLikeOnTweet);

export default router;
