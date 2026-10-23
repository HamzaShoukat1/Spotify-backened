import mongoose, { Schema, Document } from "mongoose";

export interface IDailyListeningUsage extends Document {
    user: mongoose.Types.ObjectId;
    usageDate: string;
    listenCount: number;
}

const dailyListeningUsageSchema = new Schema<IDailyListeningUsage>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        usageDate: { type: String, required: true },
        listenCount: { type: Number, required: true, default: 0, min: 0 },
    },
    { timestamps: true },
);

dailyListeningUsageSchema.index({ user: 1, usageDate: 1 }, { unique: true });

export const DailyListeningUsage = mongoose.model<IDailyListeningUsage>(
    "DailyListeningUsage",
    dailyListeningUsageSchema,
);
