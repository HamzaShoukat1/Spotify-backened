import { Router } from "express";
import { getMySubscription, createSubscriptionSetup, cancelSubscription } from "../Controllers/Subscription.controller.js";
import { verifyjwt } from "../Middlewares/auth.middleware.js";
const router = Router();
router.get("/me", verifyjwt, getMySubscription);
router.post("/create-subscription", verifyjwt, createSubscriptionSetup);
router.post("/cancel", verifyjwt, cancelSubscription);
export default router;
//# sourceMappingURL=Subscription.Route.js.map