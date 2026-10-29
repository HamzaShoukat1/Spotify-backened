import mongoose, { Schema } from 'mongoose';
export declare const Music: mongoose.Model<{
    musicTitle: string;
    primaryArtistName: string;
    Genre: string;
    Language: string;
    music?: {
        url: string;
        publicId: string;
    } | null;
    coverPhoto?: {
        url: string;
        publicId: string;
    } | null;
    uploadedBy: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    musicTitle: string;
    primaryArtistName: string;
    Genre: string;
    Language: string;
    music?: {
        url: string;
        publicId: string;
    } | null;
    coverPhoto?: {
        url: string;
        publicId: string;
    } | null;
    uploadedBy: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    musicTitle: string;
    primaryArtistName: string;
    Genre: string;
    Language: string;
    music?: {
        url: string;
        publicId: string;
    } | null;
    coverPhoto?: {
        url: string;
        publicId: string;
    } | null;
    uploadedBy: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    musicTitle: string;
    primaryArtistName: string;
    Genre: string;
    Language: string;
    music?: {
        url: string;
        publicId: string;
    } | null;
    coverPhoto?: {
        url: string;
        publicId: string;
    } | null;
    uploadedBy: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    musicTitle: string;
    primaryArtistName: string;
    Genre: string;
    Language: string;
    music?: {
        url: string;
        publicId: string;
    } | null;
    coverPhoto?: {
        url: string;
        publicId: string;
    } | null;
    uploadedBy: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    musicTitle: string;
    primaryArtistName: string;
    Genre: string;
    Language: string;
    music?: {
        url: string;
        publicId: string;
    } | null;
    coverPhoto?: {
        url: string;
        publicId: string;
    } | null;
    uploadedBy: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    musicTitle: string;
    primaryArtistName: string;
    Genre: string;
    Language: string;
    music?: {
        url: string;
        publicId: string;
    } | null;
    coverPhoto?: {
        url: string;
        publicId: string;
    } | null;
    uploadedBy: mongoose.Types.ObjectId;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    musicTitle: string;
    primaryArtistName: string;
    Genre: string;
    Language: string;
    music?: {
        url: string;
        publicId: string;
    } | null;
    coverPhoto?: {
        url: string;
        publicId: string;
    } | null;
    uploadedBy: mongoose.Types.ObjectId;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=music.model.d.ts.map