import mongoose, { Schema } from "mongoose";

const albumSchema = new Schema(
  {
    albumTitle: { type: String, required: true, trim: true },
    artistName: { type: String, required: true, trim: true },
    albumCoverArt: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tracks: [{ type: Schema.Types.ObjectId, ref: "Music", required: true }],
  },
  { timestamps: true },
);

albumSchema.index({ createdAt: -1 });

export const Album = mongoose.model("Album", albumSchema);