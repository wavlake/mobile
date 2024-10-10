import {
  createReward,
  getPromoByContentId,
  Promo,
  cachePromoData,
} from "@/utils";

const EARNING_INTERVAL = 60; // in seconds
const CHECK_INTERVAL = 1; // in seconds

let earningInterval: NodeJS.Timeout | null = null;
let currentPromoDetails: Promo | null = null;
let elapsedTime: number = 0;
let lastRewardTime: number = 0;
let isRewardInProgress: boolean = false;

const attemptReward = async () => {
  if (!currentPromoDetails || isRewardInProgress) return;

  try {
    if (elapsedTime - lastRewardTime >= EARNING_INTERVAL) {
      isRewardInProgress = true;
      const response = await createReward({
        promoId: currentPromoDetails.id,
      });

      if (response.success) {
        lastRewardTime = elapsedTime;
      }

      if (response.data) {
        cachePromoData({
          ...currentPromoDetails,
          // update the cached promo info
          promoUser: {
            ...currentPromoDetails.promoUser,
            canEarnToday: response.data.promoUser.canEarnToday,
            lifetimeEarnings: response.data.promoUser.lifetimeEarnings,
            earnedToday: response.data.promoUser.earnedToday,
            earnableToday: response.data.promoUser.earnableToday,
          },
        });
        // update the local earning's copy of current promo details
        currentPromoDetails = {
          ...currentPromoDetails,
          promoUser: {
            ...currentPromoDetails.promoUser,
            canEarnToday: response.data.promoUser.canEarnToday,
            lifetimeEarnings: response.data.promoUser.lifetimeEarnings,
            earnedToday: response.data.promoUser.earnedToday,
            earnableToday: response.data.promoUser.earnableToday,
          },
        };
      }
      if (!response.data.promoUser.canEarnToday) {
        stopEarning();
      }
    } else {
      // re-cache the promo info so its timestamp is updated
      cachePromoData(currentPromoDetails);
    }
  } catch (error) {
    console.error("Error creating reward:", error);
    stopEarning();
  } finally {
    isRewardInProgress = false;
  }
};

export const startEarning = async (trackId: string) => {
  if (earningInterval) {
    clearInterval(earningInterval);
  }

  const promoDetails = await getPromoByContentId(trackId);

  cachePromoData(promoDetails);
  if (promoDetails && promoDetails.promoUser.canEarnToday) {
    currentPromoDetails = promoDetails;

    // Reset elapsed time and last reward time
    elapsedTime = 0;
    lastRewardTime = 0;
    isRewardInProgress = false;
    earningInterval = setInterval(() => {
      elapsedTime = elapsedTime + CHECK_INTERVAL;
      attemptReward();
    }, CHECK_INTERVAL * 1000);
  } else {
    console.log("No rewards remaining, skipping earning");
  }
};

export const stopEarning = () => {
  if (earningInterval) {
    clearInterval(earningInterval);
    earningInterval = null;
  }
  currentPromoDetails = null;
  elapsedTime = 0;
  lastRewardTime = 0;
  isRewardInProgress = false;
};
