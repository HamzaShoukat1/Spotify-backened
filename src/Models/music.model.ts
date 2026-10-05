import mongoose, { Schema } from 'mongoose';

const musicSchema = new Schema(
    {
        musicTitle: {
            type: String,
            required: [true, 'Music title is required'],
            trim: true,
        },
        primaryArtistName: {
            type: String,
            required: [true, 'Primary artist name is required'],
            trim: true,
        },
        Genre: {
            type: String,
            required: [true, 'Genre is required'],
            trim: true,
        },
        Language: {
            type: String,
            required: [true, 'Language is required'],
            trim: true,
        },
        music: {
            url: { type: String, required: true },
            publicId: { type: String, required: true },
        },

        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    {
        timestamps: true,
    }
);

export const Music = mongoose.model('Music', musicSchema);

