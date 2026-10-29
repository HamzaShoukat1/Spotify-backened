import mongoose, { Schema, Document } from "mongoose";
const dailyListeningUsageSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    usageDate: { type: String, required: true },
    listenCount: { type: Number, required: true, default: 0, min: 0 },
}, { timestamps: true });
dailyListeningUsageSchema.index({ user: 1, usageDate: 1 }, { unique: true });
export const DailyListeningUsage = mongoose.model("DailyListeningUsage", dailyListeningUsageSchema);
//# sourceMappingURL=DailyListeningUsage.model.js.map