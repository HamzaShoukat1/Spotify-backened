import bcrypt from "bcryptjs";
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  gender: "Male" | "Female" | "Prefer not to say",
  name: string
  role: "user" | "artist" | "admin";
  refreshToken?: string;
  isPasswordCorrect(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Prefer not to say"],
      required: true

    },
    name: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["user", "artist", "admin"],
      default: "user",
    },

    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  });


userSchema.pre("save", async function (): Promise<void> {
  if (!this.isModified("password")) return

  this.password = await bcrypt.hash(this.password, 10)

})

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model<IUser>("User", userSchema);