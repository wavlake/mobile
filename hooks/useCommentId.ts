import { useQuery } from "@tanstack/react-query";
import { getCommentById } from "@/utils";
import { useGetCommentQueryKey } from "./useGetCommentQueryKey";

export const useCommentId = (id: number | null) => {
  const getQueryKey = useGetCommentQueryKey();
  return useQuery({
    queryKey: getQueryKey(id),
    queryFn: () => getCommentById(id),
    enabled: Boolean(id),
  });
};
