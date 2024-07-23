import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveLegacyReply } from "@/utils";
import { useGetCommentQueryKey } from "./useGetCommentQueryKey";
import { useToast } from "./useToast";

export const useSaveLegacyReply = () => {
  const toast = useToast();
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
      toast.show("Reply published");
      queryClient.invalidateQueries(getQueryKey(variables.commentId));
    },
    onError: (error) => {
      console.error(error);
      toast.show("Failed to publish reply");
    },
  });
};
