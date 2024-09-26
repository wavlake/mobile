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
  console.log({ position });
  const createReward = useCreateReward();

  const canEarn = userCanEarn && isPlaying && promoDetails && !isPromoLoading;

  const attemptReward = useCallback(async () => {
    console.log("attempting");
    if (!canEarn) {
      console.log("cannot earn");
      setIsEarning(false);
      return;
    }

    console.log("can earn");
    setIsEarning(true);

    // Check if we've moved forward by at least 59 seconds since the last reward
    if (position - lastRewardPositionRef.current >= 59) {
      try {
        const createResponse = await createReward.mutateAsync({
          promoId: promoDetails!.id,
        });

        if (createResponse.success) {
          setTotalEarned((prev) => prev + 10);
          lastRewardPositionRef.current = position;
          console.log("Reward created successfully");
        } else {
          throw new Error("Reward creation failed");
        }
      } catch (error) {
        console.error("Error creating reward:", error);
        setIsEarning(false);
      }
    } else {
      console.log("Not enough time has passed since last reward");
    }
  }, [canEarn, position, createReward.mutateAsync, promoDetails]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (canEarn && isPlaying) {
      console.log("Scheduling attempt reward");
      timeoutId = setTimeout(attemptReward, 1000); // Delay to prevent rapid re-renders
    } else {
      console.log("Cannot earn or not playing, setting isEarning to false");
      setIsEarning(false);
    }

    return () => {
      clearTimeout(timeoutId);
      console.log("Cleared timeout");
    };
  }, [canEarn, isPlaying, attemptReward]);

  useEffect(() => {
    console.log("Content ID changed, resetting states");
    setIsEarning(false);
    lastRewardPositionRef.current = 0;
    setTotalEarned(0);
  }, [contentId]);

  console.log({
    isEarning,
    totalEarned,
    canEarn,
    isPlaying,
    userCanEarn,
    promoDetails,
    isPromoLoading,
  });
  return { isEarning, totalEarned };
};
