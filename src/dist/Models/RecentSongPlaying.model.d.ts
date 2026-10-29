import mongoose from "mongoose";
export declare const RecentSongsPlaying: mongoose.Model<{
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
    playedAt: NativeDate;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
    playedAt: NativeDate;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
    playedAt: NativeDate;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
    playedAt: NativeDate;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
    playedAt: NativeDate;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
    playedAt: NativeDate;
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
    playedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
    playedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=RecentSongPlaying.model.d.ts.map