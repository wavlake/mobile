import { useState, useEffect, useRef, useCallback } from "react";
import { usePlaybackState, useProgress } from "react-native-track-player";
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
  const lastRewardPositionRef = useRef(0);
  const { position } = useProgress(5000); // sample the second position every 5 seconds
  const { mutateAsync: createReward, isLoading: rewardCreationInProgress } =
    useCreateReward();

  const attemptReward = useCallback(
    async (promoDetails: Promo) => {
      if (rewardCreationInProgress) {
        console.log("Reward creation already in progress");
        // bail if a reward is already being created
        return;
      }

      // Check if we've moved forward by at least 59 seconds since the last reward
      if (position - lastRewardPositionRef.current >= 59) {
        try {
          console.log("Creating reward for promo");
          const createResponse = await createReward({
            promoId: promoDetails.id,
          });

          console.log("Reward created:", createResponse);
          // set earning to false and satsDepleted to true if rewards are depleted
          if (createResponse.data.rewardsRemaining === false) {
            console.log("no more sats, all done");
            setSatsDepleted(true);
            setIsEarning(false);
          }

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
      } else {
        console.log("Not enough time elapsed since last reward");
      }
    },
    [position, createReward],
  );

  const canEarn = userCanEarn && isPlaying && promoDetails;
  useEffect(() => {
    if (!canEarn || satsDepleted) {
      console.log("Can't earn or sats depleted");
      // reset earning state if user can't earn or sats depleted
      isEarning && setIsEarning(false);
      return;
    }

    // ensure earning is set to true if user can earn
    !isEarning && setIsEarning(true);
    attemptReward(promoDetails);
  }, [canEarn, isPlaying, attemptReward, promoDetails]);

  // reset the earning state when the content changes
  useEffect(() => {
    setIsEarning(false);
    lastRewardPositionRef.current = 0;
    setTotalEarned(0);
    setSatsDepleted(false);
  }, [contentId]);

  return { isEarning, totalEarned };
};
