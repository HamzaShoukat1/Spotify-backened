import type { Request } from "express";

export type AuthenticatedRequest = Request & {
  user?: {
    _id: any;
    id?: string;
    sessionId?: string;
    planTier?: "free" | "premium";
  };
};
