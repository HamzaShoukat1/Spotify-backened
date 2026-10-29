import mongoose, { Schema, Document } from "mongoose";
const listeningSessionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    music: { type: Schema.Types.ObjectId, ref: "Music", required: true },
    usageDate: { type: String, required: true },
    startedAt: { type: Date, required: true },
    completedAt: Date,
    status: {
        type: String,
        enum: ["started", "completed"],
        required: true,
        default: "started",
    },
}, { timestamps: true });
listeningSessionSchema.index({ user: 1, usageDate: 1, status: 1 });
export const ListeningSession = mongoose.model("ListeningSession", listeningSessionSchema);
//# sourceMappingURL=ListeningSession.model.js.map