import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";
import dotenv from "dotenv";
dotenv.config();

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers["Authorization"]?.replace("Bearer ", "");
  if (!token) {
    throw new ApiErrors(401, "UnAuthorized access");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  if (!decodedToken) throw new ApiErrors(400, {}, "token is wrong");
  const user = await User.findById(decodedToken.user_id);
  if (!user) {
    throw new ApiErrors(400, {}, "Invalid token");
  }
  req.user = user;
  next();
});

export { verifyJWT };
