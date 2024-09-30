import { createReward } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useCreateReward = () => {
  return useMutation({
    mutationFn: (reward: { promoId: number }) => createReward(reward),
  });
};
