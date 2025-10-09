export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  INSTITUTIONAL = 'institutional',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete',
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TierFeatures {
  maxVideoQuality: string;
  downloadAllowed: boolean;
  adsEnabled: boolean;
  forumAccess: boolean;
  coursesAccess: boolean;
  skyMapAdvanced: boolean;
  liveMissionPriority: boolean;
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  [SubscriptionTier.FREE]: {
    maxVideoQuality: '720p',
    downloadAllowed: false,
    adsEnabled: true,
    forumAccess: true,
    coursesAccess: false,
    skyMapAdvanced: false,
    liveMissionPriority: false,
  },
  [SubscriptionTier.PREMIUM]: {
    maxVideoQuality: '4K',
    downloadAllowed: true,
    adsEnabled: false,
    forumAccess: true,
    coursesAccess: true,
    skyMapAdvanced: true,
    liveMissionPriority: true,
  },
  [SubscriptionTier.INSTITUTIONAL]: {
    maxVideoQuality: '4K',
    downloadAllowed: true,
    adsEnabled: false,
    forumAccess: true,
    coursesAccess: true,
    skyMapAdvanced: true,
    liveMissionPriority: true,
  },
};
