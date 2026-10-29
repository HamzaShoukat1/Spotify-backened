import mongoose, { Document } from "mongoose";
export interface IInvoice extends Document {
    user: mongoose.Types.ObjectId;
    stripeInvoiceId: string;
    stripeSubscriptionId?: string | null;
    stripePaymentIntentId?: string | null;
    amountPaid: number;
    currency: string;
    status: string;
    hostedInvoiceUrl?: string | null;
    invoicePdf?: string | null;
    paidAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Invoice: mongoose.Model<IInvoice, {}, {}, {}, Document<unknown, {}, IInvoice, {}, mongoose.DefaultSchemaOptions> & IInvoice & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInvoice>;
//# sourceMappingURL=invoice.model.d.ts.map