import { useMutation } from "@tanstack/react-query";
import { saveLegacyReply } from "@/utils";

export const useSaveLegacyReply = () => {
  return useMutation({
    mutationFn: async ({
      content,
      commentId,
    }: {
      content: string;
      commentId: number;
    }) => {
      return saveLegacyReply(content, commentId);
    },
  });
};
