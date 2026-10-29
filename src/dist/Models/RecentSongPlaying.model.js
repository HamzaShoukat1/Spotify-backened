import mongoose from "mongoose";
const recentSongPlaying = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    music: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Music",
        required: true
    },
    playedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
recentSongPlaying.index({ user: 1, playedAt: -1 });
export const RecentSongsPlaying = mongoose.model("RecentSongsPlaying", recentSongPlaying);
//# sourceMappingURL=RecentSongPlaying.model.js.map