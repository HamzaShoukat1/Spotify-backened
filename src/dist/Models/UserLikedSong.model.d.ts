import mongoose, { Schema } from "mongoose";
export declare const LikedSong: mongoose.Model<{
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=UserLikedSong.model.d.ts.map