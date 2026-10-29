import "dotenv/config";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    console.warn("WARNING: Stripe secret key is not set in environment variables.");
}
export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-12-18.acacia",
    typescript: true,
});
export const apiVersion = {};
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
//# sourceMappingURL=stripe.js.map