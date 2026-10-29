import mongoose, { Schema, Document } from "mongoose";
const invoiceSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    stripeInvoiceId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    stripeSubscriptionId: {
        type: String,
        default: null,
        index: true,
    },
    stripePaymentIntentId: {
        type: String,
        default: null,
        index: true,
    },
    amountPaid: {
        type: Number,
        required: true,
        default: 0,
    },
    currency: {
        type: String,
        required: true,
        default: "usd",
    },
    status: {
        type: String,
        required: true,
        default: "paid",
        index: true,
    },
    hostedInvoiceUrl: {
        type: String,
        default: null,
    },
    invoicePdf: {
        type: String,
        default: null,
    },
    paidAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
export const Invoice = mongoose.model("Invoice", invoiceSchema);
//# sourceMappingURL=invoice.model.js.map