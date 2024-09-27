import { useState, useEffect, useRef, useCallback } from "react";
import { usePlaybackState } from "react-native-track-player";
import { useCreateReward } from "./useCreateReward";
import { useUser } from "@/components";
import { usePromoCheck } from "./usePromoCheck";
import { Promo } from "@/utils";

export const useEarnPromo = (contentId?: string) => {
  const { data: promoDetails, isLoading: isPromoLoading } =
    usePromoCheck(contentId);
  const { catalogUser } = useUser();
  const userCanEarn = catalogUser?.isRegionVerified && !catalogUser?.isLocked;
  const { state: playbackState } = usePlaybackState();
  const isPlaying = playbackState === "playing";
  const [isEarning, setIsEarning] = useState(false);
  const [satsDepleted, setSatsDepleted] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const lastRewardTimeRef = useRef(0);
  const { mutateAsync: createReward, isLoading: rewardCreationInProgress } =
    useCreateReward();

  const attemptReward = useCallback(
    async (promoDetails: Promo) => {
      if (rewardCreationInProgress) {
        return;
      }

      // Check if we've played for at least 60 seconds since the last reward
      if (elapsedTime - lastRewardTimeRef.current >= 60) {
        try {
          const createResponse = await createReward({
            promoId: promoDetails.id,
          });

          if (createResponse.data.rewardsRemaining === false) {
            // no more earnings available
            setSatsDepleted(true);
            setIsEarning(false);
          }

          if (createResponse.success) {
            setTotalEarned((prev) => prev + promoDetails.msatPayoutAmount);
            lastRewardTimeRef.current = elapsedTime;
          } else {
            throw new Error(createResponse.error);
          }
        } catch (error) {
          console.error("Error creating reward:", error);
          setIsEarning(false);
        }
      }
    },
    [elapsedTime, createReward],
  );

  const canEarn = userCanEarn && isPlaying && promoDetails;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (canEarn && !satsDepleted) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      !isEarning && setIsEarning(true);
    } else {
      isEarning && setIsEarning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [canEarn, satsDepleted]);

  useEffect(() => {
    if (isEarning && promoDetails) {
      attemptReward(promoDetails);
    }
  }, [isEarning, elapsedTime, attemptReward, promoDetails]);

  // reset the earning state when the content changes
  useEffect(() => {
    setIsEarning(false);
    lastRewardTimeRef.current = 0;
    setElapsedTime(0);
    setTotalEarned(0);
    setSatsDepleted(false);
  }, [contentId]);

  return { isEarning, totalEarned };
};
