import mongoose, { Schema } from "mongoose";
const playlistSchema = new Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    songs: [{ type: Schema.Types.ObjectId, ref: "Music" }],
}, { timestamps: true });
playlistSchema.index({ owner: 1, createdAt: -1 });
export const Playlist = mongoose.model("Playlist", playlistSchema);
//# sourceMappingURL=playlist.model.js.map