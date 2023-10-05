import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { addToLibrary } from "@/utils";

interface Content {
  id: string;
  [key: string]: any;
}

export const useAddContentToLibrary = (queryKey: QueryKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: Content) => addToLibrary(content.id),
    // When mutate is called:
    onMutate: async (content) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousLibraryContent =
        queryClient.getQueryData<Content[]>(queryKey) ?? [];

      // Optimistically update to the new value
      queryClient.setQueryData<Content[]>(queryKey, (old = []) => [
        content,
        ...old,
      ]);

      // Return a context object with the snapshotted value
      return { previousLibraryContent };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (error, _, context) => {
      console.error(error);
      if (context?.previousLibraryContent) {
        queryClient.setQueryData(queryKey, context.previousLibraryContent);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });
};
