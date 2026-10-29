import mongoose, { Schema } from "mongoose";
const likedSongSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    music: {
        type: Schema.Types.ObjectId,
        ref: "Music",
        required: true,
    },
}, {
    timestamps: true,
});
likedSongSchema.index({ user: 1, music: 1 }, { unique: true });
export const LikedSong = mongoose.model("LikedSong", likedSongSchema);
//# sourceMappingURL=UserLikedSong.model.js.map