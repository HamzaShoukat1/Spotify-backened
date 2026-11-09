import mongoose from "mongoose";
import cloudinary from "../config.js";
import { User } from "../Models/user.model.js";
import { Subscription } from "../Models/subscription.modal.js";

// Offline entitlement configuration
export const DEFAULT_OFFLINE_GRACE_PERIOD_DAYS = 30;
export const SIGNED_URL_EXPIRATION_SECONDS = 3600; // 1 hour

export interface EntitlementResult {
  isEntitled: boolean;
  planTier: "premium" | "free";
  entitlementExpiresAt: Date | null;
  gracePeriodDays: number;
  serverTime: Date;
}

export async function validateUserPremium(userId: string | mongoose.Types.ObjectId) {
  const user = await User.findById(userId).select("planTier").lean();
  if (!user) {
    return { isPremium: false, user: null, subscription: null };
  }

  const activeSubscription = await Subscription.findOne({
    user: userId,
    status: { $in: ["active", "trialing"] },
    currentPeriodEnd: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .lean();

  const isPremium = user.planTier === "premium" && Boolean(activeSubscription);

  return {
    isPremium,
    user,
    subscription: activeSubscription,
  };
}

export async function calculateOfflineEntitlement(
  userId: string
): Promise<EntitlementResult> {
  const serverTime = new Date();
  const { isPremium, subscription } = await validateUserPremium(userId);

  if (!isPremium) {
    return {
      isEntitled: false,
      planTier: "free",
      entitlementExpiresAt: null,
      gracePeriodDays: 0,
      serverTime,
    };
  }

  // Grace period: allow up to 30 days of offline playback, but cap at subscription period end if available
  const gracePeriodEnd = new Date(
    serverTime.getTime() + DEFAULT_OFFLINE_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );

  let expiryDate = gracePeriodEnd;
  if (subscription?.currentPeriodEnd) {
    const subEnd = new Date(subscription.currentPeriodEnd);
    // If subscription ends within the grace period, offline entitlement ends at subEnd
    if (subEnd.getTime() < gracePeriodEnd.getTime()) {
      expiryDate = subEnd;
    }
  }

  return {
    isEntitled: true,
    planTier: "premium",
    entitlementExpiresAt: expiryDate,
    gracePeriodDays: DEFAULT_OFFLINE_GRACE_PERIOD_DAYS,
    serverTime,
  };
}

export function generateSignedDownloadUrl(
  publicId: string,
  expiresInSeconds: number = SIGNED_URL_EXPIRATION_SECONDS
): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  
  return cloudinary.url(publicId, {
    resource_type: "video",
    sign_url: true,
    expires_at: expiresAt,
    secure: true,
    flags: "attachment",
  });
}
