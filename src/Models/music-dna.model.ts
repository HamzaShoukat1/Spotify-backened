import mongoose, { Schema } from "mongoose";

export interface MusicDNAProfile {
  headline: string;
  personality: string;
  topGenres: string[];
  topArtists: string[];
  listeningHabits: string[];
  surprisingInsight: string;
  recommendationDirections: string[];
}

export interface IMusicDNA extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  profile: MusicDNAProfile;
  generatedAt: Date;
  expiresAt: Date;
  isLimitedData: boolean;
}

const musicDNAProfileSchema = new Schema<MusicDNAProfile>(
  {
    headline: { type: String, required: true, trim: true },
    personality: { type: String, required: true, trim: true },
    topGenres: { type: [String], default: [] },
    topArtists: { type: [String], default: [] },
    listeningHabits: { type: [String], default: [] },
    surprisingInsight: { type: String, required: true, trim: true },
    recommendationDirections: { type: [String], default: [] },
  },
  { _id: false },
);

const musicDNASchema = new Schema<IMusicDNA>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    profile: { type: musicDNAProfileSchema, required: true },
    generatedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: true },
    isLimitedData: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const MusicDNA = mongoose.model<IMusicDNA>("MusicDNA", musicDNASchema);
