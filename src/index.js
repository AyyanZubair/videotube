import { connectDB } from "./db/connection.js";
import express from "express";
const app = express()
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes.js"

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"))
app.use(cookieParser());
app.use(cors());

app.use("/api/users", userRouter);

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server started!!`);
    })
})
    .catch((error) => {
        console.log("Mongo DB connection failed!", error);
    })




