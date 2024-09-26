import { getPromoByContentId } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const usePromoCheck = (contentId?: string | boolean) => {
  return useQuery({
    queryKey: ["promoCheck", contentId],
    queryFn:
      typeof contentId === "string"
        ? () => getPromoByContentId(contentId)
        : undefined,
    enabled: Boolean(contentId),
  });
};
