import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from 'crypto'

const userSchema = new Schema(
    {

        fullName: {
            type: String,
            required: [true, "Name is required"],
            lowercase: true,
            trim: true,
            minlength: [5, 'Name must be at least 20 characters'],
            index: true,
        },

        email: {
            type: String,
            required: [true, " email is required "],
            unique: true,
            lowercase: true,
            trim: true,
        },   
        
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [ 8 , "password must be at least 8 characters"],
            select: false
        },

        subscription: {
            id: String,
            status: String
        },

        avatar: {
            type: String,
            required: true,
        },

        secrure_url: {
            type: String
        },
        

        role: {
            type: String,
            enum: ['USER', 'ADMIN'],
            default: 'USER'
        },

        refreshToken: {
            type: String
        },
        
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
    },

    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
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

       // Function to generate a password reset token
        async function generatePasswordResetToken() {
        // Step 1: Create a random token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Step 2: Hash the token using sha256 algorithm
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Step 3: Set the password reset token and expiry time
        const forgotPasswordToken = {
            token: hashedToken,
            expiry: Date.now() + 15 * 60 * 1000, // 15 minutes expiry
        };
        
        // Step 4: Return the original token
        return resetToken
        }
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
        
    );
};



export const User = mongoose.model("User", userSchema);