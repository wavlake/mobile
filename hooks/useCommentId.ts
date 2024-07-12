import { useQuery } from "@tanstack/react-query";
import { getCommentById } from "@/utils";

export const useCommentId = (id: number | null) => {
  return useQuery({
    queryKey: ["comment", id],
    queryFn: () => getCommentById(id),
    enabled: Boolean(id),
    staleTime: Infinity,
  });
};
