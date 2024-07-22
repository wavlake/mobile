import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveLegacyReply } from "@/utils";
import { useGetCommentQueryKey } from "./useGetCommentQueryKey";

export const useSaveLegacyReply = () => {
  const queryClient = useQueryClient();
  const getQueryKey = useGetCommentQueryKey();
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(getQueryKey(variables.commentId));
    },
  });
};
