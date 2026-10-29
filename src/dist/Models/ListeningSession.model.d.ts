import mongoose, { Document } from "mongoose";
export interface IListeningSession extends Document {
    user: mongoose.Types.ObjectId;
    music: mongoose.Types.ObjectId;
    usageDate: string;
    startedAt: Date;
    completedAt?: Date;
    status: "started" | "completed";
}
export declare const ListeningSession: mongoose.Model<IListeningSession, {}, {}, {}, Document<unknown, {}, IListeningSession, {}, mongoose.DefaultSchemaOptions> & IListeningSession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IListeningSession>;
//# sourceMappingURL=ListeningSession.model.d.ts.map