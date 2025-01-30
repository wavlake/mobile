import { getContentType } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useContentDetails = (contentId?: string | null) => {
  const queryClient = useQueryClient();
  const queryKey = ["content", "details", contentId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!contentId) {
        return undefined;
      }

      return getContentType(contentId);
    },
    enabled: Boolean(contentId),
  });

  const fetchContentDetails = async (contentId: string) => {
    const oldData = queryClient.getQueryData(queryKey);
    // return the old data if it exists
    if (oldData) {
      return oldData as ReturnType<typeof getContentType>;
    }

    const data = await getContentType(contentId);
    // Update the cache with the new data
    queryClient.setQueryData(queryKey, data);
    return data;
  };

  return {
    ...query,
    fetchContentDetails,
  };
};
