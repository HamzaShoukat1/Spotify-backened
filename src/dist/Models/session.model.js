// Models/session.model.ts
import mongoose, { Schema, Document } from "mongoose";
const sessionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    refreshTokenHash: {
        type: String,
        required: true,
        // unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    revokedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
export const Session = mongoose.model("Session", sessionSchema);
//# sourceMappingURL=session.model.js.map