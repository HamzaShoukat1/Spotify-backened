import mongoose, { Schema } from "mongoose";
export declare const Stream: mongoose.Model<{
    musicId: mongoose.Types.ObjectId;
    artistId: mongoose.Types.ObjectId;
    listenerId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    musicId: mongoose.Types.ObjectId;
    artistId: mongoose.Types.ObjectId;
    listenerId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    musicId: mongoose.Types.ObjectId;
    artistId: mongoose.Types.ObjectId;
    listenerId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    musicId: mongoose.Types.ObjectId;
    artistId: mongoose.Types.ObjectId;
    listenerId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    musicId: mongoose.Types.ObjectId;
    artistId: mongoose.Types.ObjectId;
    listenerId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    musicId: mongoose.Types.ObjectId;
    artistId: mongoose.Types.ObjectId;
    listenerId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    musicId: mongoose.Types.ObjectId;
    artistId: mongoose.Types.ObjectId;
    listenerId: mongoose.Types.ObjectId;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    musicId: mongoose.Types.ObjectId;
    artistId: mongoose.Types.ObjectId;
    listenerId: mongoose.Types.ObjectId;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Stream.modal.d.ts.map