import { ContentComment } from "@/utils";
import { CommentRow } from "./CommentRow";
import { useRepliesMap } from "@/hooks/useRepliesMap";

export const CommentList = ({ comments }: { comments: ContentComment[] }) => {
  const nostrRepliesMap = useRepliesMap(comments);

  return (
    <>
      {comments.map((comment) => {
        const nostrReplies = comment.eventId
          ? nostrRepliesMap[comment.eventId] ?? []
          : [];

        return (
          <CommentRow
            nostrReplies={nostrReplies}
            comment={comment}
            key={comment.id}
          />
        );
      })}
    </>
  );
};
