import { fetchContentComments } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useQueryClient } from "@tanstack/react-query";

export const getNostrCommentsQueryKey = (nostrEventId?: string | null) => {
  return ["comment", nostrEventId];
};

export const useNostrComments = (
  contentIds: string[],
  parentContentId: string,
) => {
  const { data: comments = [], isLoading } = useQuery({
    queryKey: [parentContentId, "comments"],
    queryFn: () => fetchContentComments(contentIds),
    enabled: contentIds.length > 0,
  });

  const queryClient = useQueryClient();
  // cache the comment under the comment event id
  // the /comment/id page will fetch this comment data from the cache
  comments.forEach((comment) => {
    const queryKey = getNostrCommentsQueryKey(comment.id);
    queryClient.setQueryData<Event>(queryKey, () => comment);
  });

  return comments;
};
