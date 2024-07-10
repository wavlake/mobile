import { brandColors } from "@/constants";
import { BasicAvatar } from "../BasicAvatar";
import { Text } from "@/components/Text";
import { CommentReply } from "@/utils";
import { Link } from "expo-router";
import { View } from "react-native";

export const CommentRepliesLink = ({
  replies,
  parentcommentId,
}: {
  replies: CommentReply[];
  parentcommentId: number;
}) => {
  if (replies.length === 0) {
    return undefined;
  }

  const hasContentOwnerReply = replies.some((reply) => reply.isContentOwner);

  return (
    <Link href={`/comment/${parentcommentId}`}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        {hasContentOwnerReply && (
          <BasicAvatar
            uri={replies.find((reply) => reply.isContentOwner)?.artworkUrl}
          />
        )}
        <Text
          style={{
            color: brandColors.orange.DEFAULT,
          }}
        >
          {replies.length} {replies.length > 1 ? "replies" : "reply"}
        </Text>
      </View>
    </Link>
  );
};
