import mongoose from "mongoose";
import mongoooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    discription: {
        type: String,
    },
    duration: {
        type: Number
    },
    views: {
        type: Number,
        default: 0
    },
    isPublised: {
        type: Boolean
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    videoFile: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    }

}, { timestamps: true })

videoSchema.plugin(mongoooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);