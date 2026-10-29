import mongoose, { Document } from "mongoose";
export interface IDailyListeningUsage extends Document {
    user: mongoose.Types.ObjectId;
    usageDate: string;
    listenCount: number;
}
export declare const DailyListeningUsage: mongoose.Model<IDailyListeningUsage, {}, {}, {}, Document<unknown, {}, IDailyListeningUsage, {}, mongoose.DefaultSchemaOptions> & IDailyListeningUsage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDailyListeningUsage>;
//# sourceMappingURL=DailyListeningUsage.model.d.ts.map