import mongoose from "mongoose";
export declare const Otp: mongoose.Model<{
    email: string;
    otp: string;
    purpose: "change_email_current" | "change_email_new" | "login" | "verify_email";
    attempts: number;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    email: string;
    otp: string;
    purpose: "change_email_current" | "change_email_new" | "login" | "verify_email";
    attempts: number;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    email: string;
    otp: string;
    purpose: "change_email_current" | "change_email_new" | "login" | "verify_email";
    attempts: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    email: string;
    otp: string;
    purpose: "change_email_current" | "change_email_new" | "login" | "verify_email";
    attempts: number;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    email: string;
    otp: string;
    purpose: "change_email_current" | "change_email_new" | "login" | "verify_email";
    attempts: number;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    email: string;
    otp: string;
    purpose: "change_email_current" | "change_email_new" | "login" | "verify_email";
    attempts: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    email: string;
    otp: string;
    purpose: "change_email_current" | "change_email_new" | "login" | "verify_email";
    attempts: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    email: string;
    otp: string;
    purpose: "change_email_current" | "change_email_new" | "login" | "verify_email";
    attempts: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Otp.model.d.ts.map