import mongoose, { Document } from "mongoose";
export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    refreshTokenHash: string;
    deviceName?: string;
    expiresAt: Date;
    revokedAt?: Date | null;
}
export declare const Session: mongoose.Model<ISession, {}, {}, {}, Document<unknown, {}, ISession, {}, mongoose.DefaultSchemaOptions> & ISession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISession>;
//# sourceMappingURL=session.model.d.ts.map