import { Promo } from "@/utils";
import { useState, useEffect, useRef } from "react";
import { useProgress } from "react-native-track-player";
import { useUpdateReward } from "./useUpdateReward";
import { useCreateReward } from "./useCreateReward";

export const useEarnPromo = (
  promoDetails: Promo | undefined,
  isPlaying: boolean,
) => {
  const [isEarning, setIsEarning] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);
  const lastUpdateRef = useRef(0); // Keeps track of the last minute mark when we triggered an update
  const rewardIdRef = useRef<string | null>(null); // Keeps track of the current rewardId
  const { position } = useProgress();
  const updateReward = useUpdateReward();
  const createReward = useCreateReward();

  useEffect(() => {
    const startEarning = async () => {
      if (!promoDetails || !isPlaying) return;

      // Check if we need to create a reward initially (if starting from the beginning)
      if (lastUpdateRef.current === 0) {
        const createResponse = await createReward.mutateAsync({
          promoId: promoDetails.id,
        });
        if (!createResponse.success) {
          setIsEarning(false);
          return;
        }

        // Save the rewardId from the create response
        rewardIdRef.current = createResponse.rewardId;
        setIsEarning(true);
        lastUpdateRef.current = position; // Set initial timestamp
      }

      // Check if another full minute has passed
      const elapsedTime = Math.floor((position - lastUpdateRef.current) / 60); // Elapsed minutes
      if (elapsedTime >= 1 && rewardIdRef.current) {
        // Call updateReward with the saved rewardId
        const updateResponse = await updateReward.mutateAsync({
          rewardId: rewardIdRef.current, // Use the rewardId from the previous create call
        });
        if (!updateResponse.success) {
          setIsEarning(false);
          return;
        }

        // Call createReward again and save the new rewardId
        const createResponseAgain = await createReward.mutateAsync({
          promoId: promoDetails.id,
        });
        if (!createResponseAgain.success) {
          setIsEarning(false);
          return;
        }

        // Update the rewardId and increment total earned
        rewardIdRef.current = createResponseAgain.rewardId;
        setTotalEarned((prev) => prev + 10);
        lastUpdateRef.current = position; // Update the timestamp after the reward
      }
    };

    // Start earning if promoDetails are defined and playback is active
    if (promoDetails && isPlaying) {
      startEarning();
    }

    // Stop earning when playback stops
    if (!isPlaying) {
      setIsEarning(false);
    }

    return () => {
      // Reset values on unmount or when playback stops
      if (!isPlaying) {
        lastUpdateRef.current = 0;
        rewardIdRef.current = null;
      }
    };
  }, [position, promoDetails, isPlaying]);

  return { isEarning, totalEarned };
};
