export const useGetCommentQueryKey = () => {
  return (id: number | null) => ["comment", id];
};
