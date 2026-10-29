import mongoose, { Schema, Document } from "mongoose";
const subscriptionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    stripeSubscriptionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    stripeCustomerId: {
        type: String,
        required: true,
        index: true,
    },
    stripePriceId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: [
            "incomplete",
            "incomplete_expired",
            "trialing",
            "active",
            "past_due",
            "canceled",
            "unpaid",
            "paused",
        ],
        required: true,
        default: "incomplete",
        index: true,
    },
    currentPeriodStart: {
        type: Date,
        required: true,
    },
    currentPeriodEnd: {
        type: Date,
        required: true,
    },
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
    },
    canceledAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
//# sourceMappingURL=subscription.modal.js.map