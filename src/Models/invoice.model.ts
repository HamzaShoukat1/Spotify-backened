import mongoose, { Schema, Document } from "mongoose";

export interface IInvoice extends Document {
  user: mongoose.Types.ObjectId;
  stripeInvoiceId: string;
  stripeSubscriptionId?: string | null;
  stripePaymentIntentId?: string | null;
  amountPaid: number;
  currency: string;
  status: string;
  hostedInvoiceUrl?: string | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
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

    hostedInvoiceUrl: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Invoice = mongoose.model<IInvoice>("Invoice", invoiceSchema);

