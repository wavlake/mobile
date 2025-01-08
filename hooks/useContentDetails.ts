import { getContentType } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useContentDetails = (contentId?: string | null) => {
  const queryClient = useQueryClient();
  const query = useQuery(
    [contentId],
    async () => {
      if (!contentId) {
        throw new Error("Content ID is required");
      }
      return getContentType(contentId);
    },
    {
      enabled: Boolean(contentId),
    },
  );

  const fetchContentDetails = async (contentId: string) => {
    const data = await getContentType(contentId);
    queryClient.setQueryData([contentId], data);
    return data;
  };

  return {
    ...query,
    fetchContentDetails,
  };
};
