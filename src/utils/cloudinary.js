import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.cloudinary_cloud_name,
    api_key: process.env.cloudinary_api_key,
    api_secret: process.env.cloudinary_api_secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        console.log("localFilePath:", localFilePath);
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" })
        console.log("File uploaded on cloudinary", response.url)
        //fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
    }
}

export { uploadOnCloudinary }