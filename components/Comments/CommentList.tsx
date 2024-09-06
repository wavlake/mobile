import { CommentRow } from "./CommentRow";
import { useRepliesMap } from "@/hooks/useRepliesMap";
import { Event } from "nostr-tools";

export const CommentList = ({ comments }: { comments: Event[] }) => {
  const repliesMap = useRepliesMap(comments);

  return (
    <>
      {comments.map((comment) => {
        const replies = comment.id ? repliesMap[comment.id] ?? [] : [];

        return (
          <CommentRow replies={replies} comment={comment} key={comment.id} />
        );
      })}
    </>
  );
};
