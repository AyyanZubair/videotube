import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    fullName: {
        type: String,
        required: true,
    },
    hashPassword: {
        type: String,
        required: true,
        unique: true
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],
    avatar: {
        type: String,
        required: true
    },
    coverImage: {
        type: String
    },
    refreshToken: {
        type: String
    }

}, { timestamps: true })

// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// })

// userSchema.method.isPasswordCorrect = async function (password) {
//     return await bcrypt.compare(password, this.password);

// }

export const User = mongoose.model("User", userSchema);