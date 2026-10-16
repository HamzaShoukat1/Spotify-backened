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
            enum: ['login', 'verify_email', 'change_email_current', 'change_email_new']
        },
        attempts: {
            type: Number,
            default: 0,
            required: true
        }
    },
    {
        timestamps: true
    }
);

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

otpSchema.index({ email: 1, purpose: 1 });

export const Otp = mongoose.model('Otp', otpSchema);
