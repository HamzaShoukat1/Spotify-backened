import mongoose, { Document } from "mongoose";
export type StripeSubscriptionStatus = "incomplete" | "incomplete_expired" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused";
export interface ISubscription extends Document {
    user: mongoose.Types.ObjectId;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    stripePriceId: string;
    status: StripeSubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    canceledAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Subscription: mongoose.Model<ISubscription, {}, {}, {}, Document<unknown, {}, ISubscription, {}, mongoose.DefaultSchemaOptions> & ISubscription & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISubscription>;
//# sourceMappingURL=subscription.modal.d.ts.map