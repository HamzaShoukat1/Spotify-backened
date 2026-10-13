import mongoose, { Schema } from "mongoose";

const StreamSchema = new Schema(
    {
        musicId: {
            type: Schema.Types.ObjectId,
            ref: "Music",
            required: true,
        },

        artistId: {
            type: Schema.Types.ObjectId,
            ref: "Artist",
            required: true,
        },

        listenerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

StreamSchema.index({ createdAt: -1 });
StreamSchema.index({ musicId: 1 });
StreamSchema.index({ artistId: 1, createdAt: -1 });

export const Stream = mongoose.model("Stream", StreamSchema);