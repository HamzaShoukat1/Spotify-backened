// Models/session.model.ts

import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshTokenHash: string;
  deviceName?: string;
  expiresAt: Date;
  revokedAt?: Date | null;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      unique: true,
    },


    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Session = mongoose.model<ISession>(
  "Session",
  sessionSchema
);