import Stripe from "stripe";
import mongoose from "mongoose";
import { stripe, STRIPE_WEBHOOK_SECRET } from "../config/stripe.js";
import { User } from "../Models/user.model.js";
import { Subscription } from "../Models/subscription.modal.js";
import { Invoice } from "../Models/invoice.model.js";
import { asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
function safeDate(unixTs) {
    if (typeof unixTs !== "number" || !Number.isFinite(unixTs) || unixTs <= 0) {
        return null;
    }
    return new Date(unixTs * 1000);
}
async function getValidPriceFromStripe(requestedPriceId) {
    if (requestedPriceId?.startsWith("price_")) {
        try {
            const retrieved = await stripe.prices.retrieve(requestedPriceId);
            if (retrieved.active)
                return retrieved.id;
        }
        catch {
        }
    }
    const envPriceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    if (envPriceId?.startsWith("price_")) {
        try {
            const retrieved = await stripe.prices.retrieve(envPriceId);
            if (retrieved.active)
                return retrieved.id;
        }
        catch {
        }
    }
    throw new Error("No valid Stripe Price ID could be resolved.");
}
export const createSubscriptionSetup = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new Apierror(401, "Unauthorized: valid user session required");
    }
    const user = await User.findById(userId);
    if (!user)
        throw new Apierror(404, "User account not found");
    const existingActiveSub = await Subscription.findOne({
        user: user._id,
        status: { $in: ["active", "trialing"] },
        currentPeriodEnd: { $gt: new Date() },
    });
    if (existingActiveSub) {
        throw new Apierror(400, "You already have an active Premium subscription");
    }
    const { priceId } = req.body ?? {};
    const targetPriceId = await getValidPriceFromStripe(priceId);
    let customerId = user.stripeCustomerId;
    if (!customerId) {
        const newCustomer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: { userId: user._id.toString() },
        });
        customerId = newCustomer.id;
        user.stripeCustomerId = customerId;
        await user.save();
    }
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: targetPriceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        metadata: { userId: user._id.toString() },
    });
    const latestInvoice = subscription.latest_invoice;
    const paymentIntent = latestInvoice?.payment_intent;
    if (!paymentIntent?.client_secret) {
        throw new Apierror(500, "Failed to create PaymentIntent for subscription checkout");
    }
    const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customerId }, { apiVersion: "2024-12-18.acacia" });
    const periodStart = safeDate(subscription.current_period_start) ?? new Date();
    const periodEnd = safeDate(subscription.current_period_end) ?? new Date();
    await Subscription.findOneAndUpdate({ stripeSubscriptionId: subscription.id }, {
        user: user._id,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        stripePriceId: targetPriceId,
        status: subscription.status,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
    }, { upsert: true });
    return res.status(200).json(new Apiresponse(200, {
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
        ephemeralKeySecret: ephemeralKey.secret,
        customerId,
    }, "Subscription setup generated successfully"));
});
export const cancelSubscription = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new Apierror(401, "Unauthorized");
    }
    const { cancelImmediately = false } = req.body ?? {};
    let targetSubscriptionId;
    if (!targetSubscriptionId) {
        const activeSub = await Subscription.findOne({
            user: userId,
            status: { $in: ["active", "trialing"] },
        }).sort({ createdAt: -1 });
        if (!activeSub)
            throw new Apierror(404, "No active subscription found to cancel");
        targetSubscriptionId = activeSub.stripeSubscriptionId;
    }
    if (cancelImmediately) {
        const canceled = await stripe.subscriptions.cancel(targetSubscriptionId);
        await Subscription.findOneAndUpdate({ stripeSubscriptionId: targetSubscriptionId }, { status: canceled.status, cancelAtPeriodEnd: false, canceledAt: new Date() });
        await User.findByIdAndUpdate(userId, { planTier: "free" });
        return res.status(200).json(new Apiresponse(200, { subscriptionId: targetSubscriptionId, status: canceled.status, cancelImmediately: true }, "Subscription cancelled immediately"));
    }
    const updated = await stripe.subscriptions.update(targetSubscriptionId, {
        cancel_at_period_end: true,
    });
    const periodEnd = safeDate(updated.current_period_end) ?? new Date();
    await Subscription.findOneAndUpdate({ stripeSubscriptionId: targetSubscriptionId }, { cancelAtPeriodEnd: true, currentPeriodEnd: periodEnd });
    return res.status(200).json(new Apiresponse(200, {
        subscriptionId: targetSubscriptionId,
        status: updated.status,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: periodEnd,
    }, "Subscription scheduled for cancellation at end of billing cycle"));
});
export const getMySubscription = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId)
        throw new Apierror(401, "Unauthorized");
    const user = await User.findById(userId).select("planTier").lean();
    if (!user)
        throw new Apierror(404, "User not found");
    const subscription = await Subscription.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .lean();
    return res.status(200).json(new Apiresponse(200, {
        planTier: user.planTier || "free",
        isPremium: user.planTier === "premium",
        subscription: subscription
            ? {
                id: subscription._id,
                stripeSubscriptionId: subscription.stripeSubscriptionId,
                stripePriceId: subscription.stripePriceId,
                status: subscription.status,
                currentPeriodStart: subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd,
                cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                canceledAt: subscription.canceledAt,
            }
            : null,
    }, "Subscription metadata fetched successfully"));
});
const findUserByStripeData = async (metadataUserId, customerId) => {
    if (metadataUserId && mongoose.isValidObjectId(metadataUserId)) {
        const user = await User.findById(metadataUserId);
        if (user)
            return user;
    }
    if (customerId) {
        return await User.findOne({ stripeCustomerId: customerId });
    }
    return null;
};
export const handleStripeWebhook = async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
        res.status(400).json({ error: "Missing stripe-signature header" });
        return;
    }
    if (!STRIPE_WEBHOOK_SECRET) {
        console.error("[Stripe Webhook Configuration Error] STRIPE_WEBHOOK_SECRET is not configured");
        res.status(500).json({ error: "Stripe webhook is not configured" });
        return;
    }
    if (!Buffer.isBuffer(req.body)) {
        console.error("[Stripe Webhook Request Error] Expected the unparsed request body as a Buffer");
        res.status(400).json({ error: "Webhook request body must be raw JSON" });
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Webhook verification failed";
        console.error(`[Stripe Webhook Signature Error] ${message}`);
        res.status(400).send(`Webhook Error: ${message}`);
        return;
    }
    try {
        switch (event.type) {
            case "invoice.paid":
            case "invoice.payment_succeeded": {
                const invoice = event.data.object;
                const invoiceWithParent = invoice;
                const invoiceSubscription = invoice.subscription ??
                    invoiceWithParent.parent?.subscription_details?.subscription;
                const subId = typeof invoiceSubscription === "string"
                    ? invoiceSubscription
                    : invoiceSubscription?.id;
                if (!subId) {
                    console.warn(`[Stripe Webhook] ${event.type} skipped: invoice ${invoice.id} has no subscription reference`);
                    break;
                }
                const subscription = await stripe.subscriptions.retrieve(subId);
                const custId = typeof subscription.customer === "string"
                    ? subscription.customer
                    : subscription.customer.id;
                let user = await findUserByStripeData(subscription.metadata?.userId, custId);
                if (!user) {
                    user = await User.findOne({ stripeCustomerId: custId });
                }
                if (!user) {
                    console.warn(`[Stripe Webhook] invoice.payment_succeeded dropped: No local user found for customer ID ${custId}`);
                    break;
                }
                user.planTier = "premium";
                if (!user.stripeCustomerId)
                    user.stripeCustomerId = custId;
                await user.save();
                await Subscription.findOneAndUpdate({ stripeSubscriptionId: subscription.id }, {
                    user: user._id,
                    stripeSubscriptionId: subscription.id,
                    stripeCustomerId: custId,
                    stripePriceId: subscription.items.data[0]?.price.id,
                    status: subscription.status,
                    currentPeriodStart: safeDate(subscription.current_period_start) ?? new Date(),
                    currentPeriodEnd: safeDate(subscription.current_period_end) ?? new Date(),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    canceledAt: null,
                }, { upsert: true });
                const invoiceWithPayments = invoice;
                const directPaymentIntent = invoice.payment_intent;
                const invoicePaymentIntent = typeof directPaymentIntent === "string"
                    ? directPaymentIntent
                    : directPaymentIntent?.id ??
                        invoiceWithPayments.payments?.data?.find((payment) => payment.payment?.type === "payment_intent")?.payment?.payment_intent;
                const piId = typeof invoicePaymentIntent === "string"
                    ? invoicePaymentIntent
                    : invoicePaymentIntent?.id ?? null;
                if (!piId) {
                    console.warn(`[Stripe Webhook] Paid invoice ${invoice.id} has no PaymentIntent reference; saving invoice with null stripePaymentIntentId`);
                }
                await Invoice.findOneAndUpdate({ stripeInvoiceId: invoice.id }, {
                    user: user._id,
                    stripeInvoiceId: invoice.id,
                    stripeSubscriptionId: subscription.id,
                    stripePaymentIntentId: piId,
                    amountPaid: invoice.amount_paid,
                    currency: invoice.currency,
                    status: invoice.status ?? "paid",
                    hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
                    invoicePdf: invoice.invoice_pdf ?? null,
                    paidAt: safeDate(invoice.status_transitions?.paid_at ?? undefined) ?? new Date(),
                }, { upsert: true });
                break;
            }
            case "customer.subscription.updated": {
                const subscription = event.data.object;
                const custId = typeof subscription.customer === "string"
                    ? subscription.customer
                    : subscription.customer.id;
                let user = await findUserByStripeData(subscription.metadata?.userId, custId);
                if (!user) {
                    user = await User.findOne({ stripeCustomerId: custId });
                }
                if (!user) {
                    console.warn(`[Stripe Webhook] customer.subscription.updated dropped: No local user found for customer ID ${custId}`);
                    break;
                }
                const isActive = ["active", "trialing"].includes(subscription.status);
                user.planTier = isActive ? "premium" : "free";
                await user.save();
                await Subscription.findOneAndUpdate({ stripeSubscriptionId: subscription.id }, {
                    user: user._id,
                    stripeSubscriptionId: subscription.id,
                    stripeCustomerId: custId,
                    stripePriceId: subscription.items.data[0]?.price.id,
                    status: subscription.status,
                    currentPeriodStart: safeDate(subscription.current_period_start) ?? new Date(),
                    currentPeriodEnd: safeDate(subscription.current_period_end) ?? new Date(),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    canceledAt: safeDate(subscription.canceled_at ?? undefined),
                }, { upsert: true });
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const custId = typeof subscription.customer === "string"
                    ? subscription.customer
                    : subscription.customer.id;
                let user = await findUserByStripeData(subscription.metadata?.userId, custId);
                if (!user) {
                    user = await User.findOne({ stripeCustomerId: custId });
                }
                if (!user) {
                    console.warn(`[Stripe Webhook] customer.subscription.deleted dropped: No local user found for customer ID ${custId}`);
                    break;
                }
                user.planTier = "free";
                await user.save();
                await Subscription.findOneAndUpdate({ stripeSubscriptionId: subscription.id }, { status: "canceled", cancelAtPeriodEnd: false, canceledAt: new Date() });
                break;
            }
            case "invoice.payment_failed": {
                const invoice = event.data.object;
                console.warn(`[Stripe] Invoice payment failed — Invoice ID: ${invoice.id}`);
                break;
            }
        }
        res.status(200).json({ received: true });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown webhook processing error";
        console.error(`[Webhook Processing Error] ${message}`);
        res.status(500).json({ error: "Internal webhook processing error" });
    }
};
//# sourceMappingURL=Subscription.controller.js.map