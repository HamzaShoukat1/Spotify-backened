import express, { Router } from "express";
import {
  createSubscriptionSetup,
  cancelSubscription,
  getMySubscription,
  handleStripeWebhook,
} from "../Controllers/Subscription.controller.js";
import { verifyjwt } from "../Middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

router.get("/me", verifyjwt, getMySubscription);
router.post("/create-subscription", verifyjwt, createSubscriptionSetup);
router.post("/cancel", verifyjwt, cancelSubscription);

export default router;

