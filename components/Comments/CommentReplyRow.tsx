import { CommentReply } from "@/utils";
import { View, ViewProps } from "react-native";
import { BasicAvatar } from "../BasicAvatar";
import { Text } from "@/components/Text";

interface CommentReplyRow extends ViewProps {
  reply: CommentReply;
}

export const CommentReplyRow = ({ reply }: CommentReplyRow) => {
  const {
    name,
    content,
    userId,
    createdAt,
    parentId,
    profileUrl,
    isContentOwner,
    artworkUrl,
  } = reply;

  return (
    <View
      style={{
        marginBottom: 16,
        flexDirection: "row",
        paddingHorizontal: 16,
        display: "flex",
        alignItems: "center",
      }}
    >
      <BasicAvatar uri={artworkUrl} pubkey={userId} />
      <View style={{ marginLeft: 10, flex: 1 }}>
        {content && <Text bold>{content}</Text>}
      </View>
    </View>
  );
};
