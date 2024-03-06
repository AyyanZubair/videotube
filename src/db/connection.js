import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.Database_URI}/videotube`);
        console.log("MongoDB Connected !!");
    } catch (error) {
        console.error("mongoDB connection failed", error);
    }
}

export { connectDB }