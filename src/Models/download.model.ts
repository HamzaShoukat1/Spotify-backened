import mongoose, { Schema, Document } from "mongoose";

export type DownloadStatus = "authorized" | "completed" | "revoked";

export interface IDownload extends Document {
  user: mongoose.Types.ObjectId;
  music: mongoose.Types.ObjectId;
  musicTitle: string;
  primaryArtistName: string;
  coverPhotoUrl: string;
  fileSize?: number;
  duration?: number;
  status: DownloadStatus;
  authorizedAt: Date;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const downloadSchema = new Schema<IDownload>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    music: {
      type: Schema.Types.ObjectId,
      ref: "Music",
      required: true,
      index: true,
    },
    musicTitle: {
      type: String,
      required: true,
      trim: true,
    },
    primaryArtistName: {
      type: String,
      required: true,
      trim: true,
    },
    coverPhotoUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["authorized", "completed", "revoked"],
      default: "authorized",
      index: true,
    },
    authorizedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

downloadSchema.index({ user: 1, music: 1 }, { unique: true });

export const Download = mongoose.model<IDownload>("Download", downloadSchema);
