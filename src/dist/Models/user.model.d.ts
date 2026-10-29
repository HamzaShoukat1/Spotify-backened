import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    email: string;
    password: string;
    gender: "Male" | "Female" | "Prefer not to say";
    name: string;
    onboarding: boolean;
    favoriteArtists: mongoose.Types.ObjectId[];
    role: "user" | "artist" | "admin";
    stripeCustomerId?: string | null | undefined;
    planTier: "free" | "premium";
    isPasswordCorrect(password: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
//# sourceMappingURL=user.model.d.ts.map