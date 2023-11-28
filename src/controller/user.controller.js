import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        if ([fullName, email, password].some((field) => field.trim() === "")) {
            throw new ApiError(400, "All Fields are required");
        }

        // email validation
        const isValidEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        if (!isValidEmail(email)) {
            throw new ApiError(400, "Invalid email address");
        }

        // if already user exists
        const existUser = await User.findOne({
            $or: [{ email }]
        });

        if (existUser) {
            throw new ApiError(409, "Email id alredy exists");
        }

        const avatarLocalPath = req.files?.avatar[0]?.path;

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required");
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);

        if (!avatar) {
            throw new ApiError(400, "Avatar file upload failed :-(");
        }

        const user = await User.create({
            fullName,
            avatar: avatar.url,
            email,
            password,
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering a user");
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User Registered successfully")
        );
    } catch (error) {
        // Pass the error to the error-handling middleware
        next(error);
    }
});

export { registerUser };
