import mongoose, { Schema, Document } from "mongoose";

export interface IListeningSession extends Document {
  user: mongoose.Types.ObjectId;
  music: mongoose.Types.ObjectId;
  usageDate: string;
  startedAt: Date;
  completedAt?: Date;
  status: "started" | "completed";
}

const listeningSessionSchema = new Schema<IListeningSession>(
  {
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
  },
  { timestamps: true },
);

listeningSessionSchema.index({ user: 1, usageDate: 1, status: 1 });

export const ListeningSession = mongoose.model<IListeningSession>(
  "ListeningSession",
  listeningSessionSchema,
);
