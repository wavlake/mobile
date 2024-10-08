import {
  createReward,
  getPromoByContentId,
  Promo,
  getCachedPromoData,
  cachePromoData,
} from "@/utils";

const EARNING_INTERVAL = 60; // in seconds
const CHECK_INTERVAL = 1; // in seconds

let earningInterval: NodeJS.Timeout | null = null;
let currentPromoDetails: Promo | null = null;
let elapsedTime: number = 0;
let lastRewardTime: number = 0;
let totalEarned: number = 0;

const attemptReward = async () => {
  if (!currentPromoDetails) return;

  try {
    if (elapsedTime - lastRewardTime >= EARNING_INTERVAL) {
      const response = await createReward({
        promoId: currentPromoDetails.id,
      });

      if (response.success) {
        totalEarned += currentPromoDetails.msatPayoutAmount;
        lastRewardTime = elapsedTime;
      }

      if (response.data) {
        cachePromoData({
          ...currentPromoDetails,
          // update the cached promo info
          rewardsRemaining: response.data.rewardsRemaining,
          totalEarnedToday: response.data.totalEarnedToday,
          availableEarnings: response.data.availableEarnings,
        });
      }
      if (!response.data.rewardsRemaining) {
        stopEarning();
      }
    }
  } catch (error) {
    console.error("Error creating reward:", error);
    stopEarning();
  }
};

export const startEarning = async (trackId: string) => {
  if (earningInterval) {
    clearInterval(earningInterval);
  }

  const promoDetails = await getPromoByContentId(trackId);

  cachePromoData(promoDetails);

  if (promoDetails && promoDetails.rewardsRemaining) {
    currentPromoDetails = promoDetails;

    // Reset elapsed time and last reward time
    elapsedTime = 0;
    lastRewardTime = 0;

    earningInterval = setInterval(() => {
      elapsedTime++;
      attemptReward();
    }, CHECK_INTERVAL * 1000);
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
};

export const getTotalEarned = () => totalEarned;
