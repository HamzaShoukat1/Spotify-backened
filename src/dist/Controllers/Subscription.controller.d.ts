import type { Request, Response } from "express";
export declare const createSubscriptionSetup: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const cancelSubscription: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getMySubscription: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const handleStripeWebhook: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=Subscription.controller.d.ts.map