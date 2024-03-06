import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

async function generateAccessToken(user_id, username, hashPassword) {
  const payload = {
    user_id,
    username,
    hashPassword,
  };
  const tokenExpiry =  86400;
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: tokenExpiry,
  });
}

async function generateRefreshToken(user_id) {
  const payload = {
    user_id,
  };
  const tokenExpiry = 864000;
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: tokenExpiry,
  });
}

export { generateAccessToken, generateRefreshToken };
