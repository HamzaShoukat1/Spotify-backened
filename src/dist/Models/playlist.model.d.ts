import mongoose, { Schema } from "mongoose";
export declare const Playlist: mongoose.Model<{
    name: string;
    owner: mongoose.Types.ObjectId;
    songs: mongoose.Types.ObjectId[];
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    name: string;
    owner: mongoose.Types.ObjectId;
    songs: mongoose.Types.ObjectId[];
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    name: string;
    owner: mongoose.Types.ObjectId;
    songs: mongoose.Types.ObjectId[];
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    name: string;
    owner: mongoose.Types.ObjectId;
    songs: mongoose.Types.ObjectId[];
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    name: string;
    owner: mongoose.Types.ObjectId;
    songs: mongoose.Types.ObjectId[];
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    name: string;
    owner: mongoose.Types.ObjectId;
    songs: mongoose.Types.ObjectId[];
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    name: string;
    owner: mongoose.Types.ObjectId;
    songs: mongoose.Types.ObjectId[];
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    name: string;
    owner: mongoose.Types.ObjectId;
    songs: mongoose.Types.ObjectId[];
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=playlist.model.d.ts.map