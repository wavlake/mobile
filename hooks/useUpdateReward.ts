import { updateReward } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useUpdateReward = () => {
  return useMutation({
    mutationFn: (reward: any) => updateReward(reward),
  });
};
