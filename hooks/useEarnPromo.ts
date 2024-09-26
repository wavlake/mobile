import { useState, useEffect, useRef, useCallback } from "react";
import { usePlaybackState, useProgress } from "react-native-track-player";
import { useCreateReward } from "./useCreateReward";
import { useUser } from "@/components";
import { usePromoCheck } from "./usePromoCheck";

export const useEarnPromo = (contentId?: string) => {
  const { data: promoDetails, isLoading: isPromoLoading } =
    usePromoCheck(contentId);
  const { catalogUser } = useUser();
  const userCanEarn = catalogUser?.isRegionVerified && !catalogUser?.isLocked;
  const { state: playbackState } = usePlaybackState();
  const isPlaying = playbackState === "playing";
  const [isEarning, setIsEarning] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);
  const lastRewardPositionRef = useRef(0);
  const { position } = useProgress(5000); // Update every 5 seconds for testing, change back to 60000 for production
  const createReward = useCreateReward();
  const canEarn = userCanEarn && isPlaying && promoDetails && !isPromoLoading;

  const attemptReward = useCallback(async () => {
    if (!canEarn) {
      setIsEarning(false);
      return;
    }

    setIsEarning(true);

    // Check if we've moved forward by at least 59 seconds since the last reward
    if (position - lastRewardPositionRef.current >= 59) {
      try {
        const createResponse = await createReward.mutateAsync({
          promoId: promoDetails!.id,
        });

        if (createResponse.success) {
          setTotalEarned((prev) => prev + promoDetails.msatPayoutAmount);
          lastRewardPositionRef.current = position;
        } else {
          throw new Error("Reward creation failed");
        }
      } catch (error) {
        console.error("Error creating reward:", error);
        setIsEarning(false);
      }
    }
  }, [canEarn, position, createReward.mutateAsync, promoDetails]);

  useEffect(() => {
    if (canEarn && isPlaying) {
      attemptReward();
    } else {
      isEarning && setIsEarning(false);
    }
  }, [canEarn, isPlaying, attemptReward]);

  useEffect(() => {
    setIsEarning(false);
    lastRewardPositionRef.current = 0;
    setTotalEarned(0);
  }, [contentId]);

  return { isEarning, totalEarned };
};
