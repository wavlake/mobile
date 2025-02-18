import { View, LayoutChangeEvent } from "react-native";
import { Text } from "../shared/Text";
import { CommentContentProps } from "./types";
import { ParsedTextRender } from "./ParsedTextRenderer";
import { CommentMetadata } from "./CommentMetadata";
import { Event } from "nostr-tools";
import { getCommentText } from "./utils";
import { AssociatedContent } from "./AssociatedContent";
import { ReactionInfo, Repost, ZapInfo } from "./InteractionComponents";
import { useDecodedProfile } from "@/hooks";
import { useState, useCallback } from "react";
import { parseZapRequestFromReceipt } from "@/utils";

const MIN_WIDTH = 50;

export const CommentContent = ({
  comment,
  npubMetadata,
  associatedContentId,
  closeParent,
}: CommentContentProps) => {
  const isZap = comment.kind === 9735;
  const authorPubkey = isZap
    ? parseZapRequestFromReceipt(comment)?.receipt?.pubkey
    : comment.pubkey;
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const { data: authorProfile, isLoading } = useDecodedProfile(authorPubkey);

  const commentText = getCommentText(comment, npubMetadata);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  }, []);

  const isTooNarrow = containerWidth > 0 && containerWidth < MIN_WIDTH;

  if (isTooNarrow) {
    return (
      <View style={{ padding: 8 }}>
        <Text>...</Text>
      </View>
    );
  }

  return (
    <View
      onLayout={onLayout}
      style={{
        width: "100%",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {associatedContentId ? (
        <AssociatedContent
          contentId={associatedContentId}
          npubMetadata={authorProfile}
          metadataIsLoading={isLoading}
        />
      ) : (
        <CommentMetadata
          npubMetadata={authorProfile}
          metadataIsLoading={isLoading}
          pubkey={comment.pubkey}
          closeParent={closeParent}
        />
      )}

      <CommentBody
        comment={comment}
        commentText={commentText}
        associatedContentId={associatedContentId}
      />
    </View>
  );
};

interface CommentBodyProps {
  comment: Event;
  commentText: string;
  associatedContentId?: string | null;
}

const CommentBody = ({
  comment,
  commentText,
  associatedContentId,
}: CommentBodyProps) => (
  <View
    style={{
      marginLeft: associatedContentId ? 10 : 0,
      flex: 1,
    }}
  >
    {comment.kind === 7 && <ReactionInfo comment={comment} />}
    {comment.kind === 6 && <Repost comment={comment} />}
    {comment.kind === 9735 && <ZapInfo comment={comment} />}
    {(comment.kind === 1 || comment.kind === 9734 || comment.kind === 20) && (
      <ParsedTextRender content={commentText} />
    )}
  </View>
);
