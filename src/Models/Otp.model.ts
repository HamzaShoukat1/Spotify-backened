import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        otp: {
            type: String,
            required: true
        },
        purpose: {
            type: String,
            required: true,
            enum: ['login', 'verify_email']
        },
        attempts: {
            type: Number,
            default: 0,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 600 
        }

    },
    { timestamps: { createdAt: false, updatedAt: true } }
);

otpSchema.index({ email: 1 });

export const Otp = mongoose.model('Otp', otpSchema);
