import mongoose, { Schema } from "mongoose";

export type ChatMessageRole = "user" | "assistant";
export type ChatSessionStatus = "processing" | "completed" | "failed";

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  createdAt: Date;
}

export interface IChatSession extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  messages: ChatMessage[];
  playlist?: mongoose.Types.ObjectId;
  status: ChatSessionStatus;
  errorMessage?: string;
}

const chatMessageSchema = new Schema<ChatMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const chatSessionSchema = new Schema<IChatSession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messages: { type: [chatMessageSchema], required: true, default: [] },
    playlist: { type: Schema.Types.ObjectId, ref: "Playlist" },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
      index: true,
    },
    errorMessage: { type: String },
  },
  { timestamps: true },
);

chatSessionSchema.index({ user: 1, createdAt: -1 });

export const ChatSession = mongoose.model<IChatSession>("ChatSession", chatSessionSchema);
