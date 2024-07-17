import { ContentComment, fetchReplies } from "@/utils";
import { CommentRow } from "./CommentRow";
import { useQuery } from "@tanstack/react-query";
import { Event } from "nostr-tools";

export const CommentList = ({ comments }: { comments: ContentComment[] }) => {
  const definedEventIds = comments.reduce<string[]>((acc, comment) => {
    if (comment.eventId) {
      acc.push(comment.eventId);
    }
    return acc;
  }, []);

  const { data = {} } = useQuery(
    definedEventIds,
    async () => {
      const replies = await fetchReplies(definedEventIds);
      const repliesMap = replies.reduce<Record<string, Event[]>>(
        (acc, reply) => {
          const [eTag, parentCommentId] =
            reply.tags.find(([tag, value]) => tag === "e") || [];
          if (parentCommentId) {
            acc[parentCommentId] = [...(acc[parentCommentId] || []), reply];
          }

          return acc;
        },
        {},
      );
      return repliesMap;
    },
    {
      enabled: definedEventIds.length > 0,
    },
  );
  return (
    <>
      {comments.map((comment) => {
        const replies = comment.eventId ? data[comment.eventId] ?? [] : [];

        return (
          <CommentRow replies={replies} comment={comment} key={comment.id} />
        );
      })}
    </>
  );
};
