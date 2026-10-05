import mongoose, { Schema } from "mongoose";



const ArtistSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: [true, 'Artist name is required'],
            default: '',
            trim: true,
        },
        artistType: { type: String, required: true, trim: true, default: '' },
        genres: { type: String, required: true, trim: true, default: '' },
        bio: { type: String, default: "", trim: true, maxlength: 500, },
        profileImage: {
            url: { type: String, required: true },
            publicId: { type: String, required: true },
        },
        coverImage: {
            url: { type: String },
            publicId: { type: String, required: true },
        },
    },
    {
        timestamps: true,
    });



export const Artist = mongoose.model<any>("Artist", ArtistSchema);