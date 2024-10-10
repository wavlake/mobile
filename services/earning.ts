import {
  createReward,
  getPromoByContentId,
  Promo,
  cachePromoData,
} from "@/utils";
import TrackPlayer from "react-native-track-player";

const EARNING_INTERVAL = 60; // in seconds
const CHECK_INTERVAL = 1; // in seconds
const SEEK_THRESHOLD = 5; // in seconds

class EarningManager {
  private static instance: EarningManager;
  private earningInterval: NodeJS.Timeout | null = null;
  private currentPromoDetails: Promo | null = null;
  private elapsedTime: number = 0;
  private lastRewardTime: number = 0;
  private lastPlayerPosition: number = 0;
  private isRewardInProgress: boolean = false;
  private isPlaying: boolean = false;
  private currentTrackId: string | null = null;

  private constructor() {
    console.log("EarningManager instance created");
  }

  public static getInstance(): EarningManager {
    if (!EarningManager.instance) {
      EarningManager.instance = new EarningManager();
    }
    return EarningManager.instance;
  }

  private async attemptReward() {
    if (
      !this.currentPromoDetails ||
      this.isRewardInProgress ||
      !this.isPlaying
    ) {
      return;
    }

    try {
      const { position: currentPlayerPosition } =
        await TrackPlayer.getProgress();

      // Check if a seek has occurred and reset timers
      // if (currentPlayerPosition - this.lastPlayerPosition > SEEK_THRESHOLD) {
      //   console.log("Seek detected, resetting timers");
      //   this.elapsedTime = 0;
      //   this.lastRewardTime = 0;
      //   this.lastPlayerPosition = currentPlayerPosition;
      //   return;
      // }

      const playerElapsedTime = currentPlayerPosition - this.lastPlayerPosition;
      const playerProgressCheck = playerElapsedTime >= EARNING_INTERVAL;
      const elapsedTimeCheck =
        this.elapsedTime - this.lastRewardTime >= EARNING_INTERVAL;
      if (
        elapsedTimeCheck
        // && playerProgressCheck
      ) {
        this.isRewardInProgress = true;
        const response = await createReward({
          promoId: this.currentPromoDetails.id,
        });

        if (response.success) {
          this.lastRewardTime = this.elapsedTime;
          this.lastPlayerPosition = currentPlayerPosition;
        }

        if (response.data) {
          const updatedPromoDetails = {
            ...this.currentPromoDetails,
            promoUser: {
              ...this.currentPromoDetails.promoUser,
              canEarnToday: response.data.promoUser.canEarnToday,
              lifetimeEarnings: response.data.promoUser.lifetimeEarnings,
              earnedToday: response.data.promoUser.earnedToday,
              earnableToday: response.data.promoUser.earnableToday,
            },
          };
          cachePromoData(updatedPromoDetails);
          this.currentPromoDetails = updatedPromoDetails;
        }

        if (!response.data.promoUser.canEarnToday) {
          this.stopEarning();
        }
      } else {
        this.lastPlayerPosition = currentPlayerPosition;
        cachePromoData(this.currentPromoDetails);
      }
    } catch (error) {
      console.error("Error creating reward:", error);
      this.stopEarning();
    } finally {
      this.isRewardInProgress = false;
    }
  }

  public async startEarning(trackId: string) {
    if (this.currentTrackId === trackId && this.currentPromoDetails) {
      this.resumeEarning();
      return;
    }

    const promoDetails = await getPromoByContentId(trackId);

    if (promoDetails && promoDetails.promoUser.canEarnToday) {
      this.currentPromoDetails = promoDetails;
      this.currentTrackId = trackId;

      this.elapsedTime = 0;
      this.lastRewardTime = 0;
      const { position } = await TrackPlayer.getProgress();
      this.lastPlayerPosition = position;
      this.isRewardInProgress = false;
      this.isPlaying = true;

      this.ensureInterval();
      cachePromoData(promoDetails);
    } else {
      this.stopEarning();
    }
  }

  public stopEarning() {
    if (this.earningInterval) {
      clearInterval(this.earningInterval);
      this.earningInterval = null;
    }
    this.isPlaying = false;
  }

  public pauseEarning() {
    this.isPlaying = false;
  }

  public async resumeEarning() {
    if (
      this.currentPromoDetails &&
      this.currentPromoDetails.promoUser.canEarnToday
    ) {
      const { position } = await TrackPlayer.getProgress();
      this.lastPlayerPosition = position;
      this.isPlaying = true;
      this.ensureInterval();
    } else {
      if (this.currentTrackId) {
        this.startEarning(this.currentTrackId);
      }
    }
  }

  private ensureInterval() {
    if (!this.earningInterval) {
      this.earningInterval = setInterval(() => {
        if (this.isPlaying) {
          this.elapsedTime += CHECK_INTERVAL;
          this.attemptReward();
        } else {
        }
      }, CHECK_INTERVAL * 1000);
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      hasPromo: !!this.currentPromoDetails,
      currentTrackId: this.currentTrackId,
      elapsedTime: this.elapsedTime,
    };
  }
}

// Export singleton methods
export const startEarning = (trackId: string) =>
  EarningManager.getInstance().startEarning(trackId);
export const stopEarning = () => EarningManager.getInstance().stopEarning();
export const pauseEarning = () => EarningManager.getInstance().pauseEarning();
export const resumeEarning = () => EarningManager.getInstance().resumeEarning();
export const getEarningStatus = () => EarningManager.getInstance().getStatus();
