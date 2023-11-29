import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from 'crypto';
import cloudinary from 'cloudinary'; // Make sure to import cloudinary
import fs from 'fs'; // Make sure to import fs

// Configure Cloudinary (You need to set up your Cloudinary account and get the configuration details)
cloudinary.config({
    cloud_name: 'your_cloud_name',
    api_key: 'your_api_key',
    api_secret: 'your_api_secret'
});

const userSchema = new Schema(
    {
        fullName: {
        type: String,
        required: [true, "Name is required"],
        lowercase: true,
        trim: true,
        minlength: [5, 'Name must be at least 5 characters'],
        index: true,
        },
        email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        },
        password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
        select: false,
        },
        subscription: {
        id: String,
        status: String,
        },
        avatar: {
        type: String,
        required: true,
        },
        secure_url: {
        type: String,
        },
        role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER',
        },
        refreshToken: {
        type: String,
        },
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
}
next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
return jwt.sign(
    {
        _id: this._id,
        email: this.email,
        role: this.role,
        subscription: this.subscription,
        fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
);
};

// Move this part outside of the userSchema.methods
userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const forgotPasswordToken = {
    token: hashedToken,
    expiry: Date.now() + 15 * 60 * 1000, // 15 minutes expiry
};
return resetToken;
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
    {
    _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
);
};

// Handle the cloudinary upload in a separate function
userSchema.methods.uploadAvatar = async function (file) {
    try {
    const result = await cloudinary.v2.uploader.upload(file.path, {
        folder: 'lms',
        width: 250,
        height: 250,
        gravity: 'faces',
        crop: 'fill',
    });

    if (result) {
        this.avatar = result.secure_url;
        this.secure_url = result.secure_url;
      fs.rm(file.path); // Remove the file from local storage
    }
} catch (error) {
    throw new Error(error || 'File not uploaded, please try again');
}
};

export const User = mongoose.model("User", userSchema);
