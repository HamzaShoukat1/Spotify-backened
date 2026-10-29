import bcrypt from "bcryptjs";
import mongoose, { Schema, Document } from "mongoose";
const userSchema = new Schema({
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
        minlength: 8,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Prefer not to say"],
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    onboarding: {
        type: Boolean,
        default: false,
    },
    favoriteArtists: [
        {
            type: Schema.Types.ObjectId,
            ref: "Artist",
        },
    ],
    role: {
        type: String,
        enum: ["user", "artist", "admin"],
        default: "user",
    },
    // refreshToken: {
    //   type: String,
    //   default: null,
    // },
    stripeCustomerId: {
        type: String,
        default: null,
        index: true,
    },
    planTier: {
        type: String,
        enum: ["free", "premium"],
        default: "free",
        index: true,
    },
}, {
    timestamps: true,
});
userSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return;
    this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
export const User = mongoose.model("User", userSchema);
//# sourceMappingURL=user.model.js.map