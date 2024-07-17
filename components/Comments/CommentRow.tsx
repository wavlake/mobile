import { ContentComment, encodeNpub } from "@/utils";
import { TouchableOpacity, View, ViewProps } from "react-native";
import { BasicAvatar } from "../BasicAvatar";
import { SatsEarned } from "../SatsEarned";
import { Text } from "@/components/Text";
import { CommentRepliesLink } from "./CommentRepliesLink";
import { ReplyDialog } from "./ReplyDialog";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CommentRowProps extends ViewProps {
  comment: ContentComment;
  replies?: any[];
  showReplyLinks?: boolean;
}

export const CommentRow = ({
  comment,
  replies = [],
  showReplyLinks = true,
}: CommentRowProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const onReplyPress = () => {
    setDialogOpen(true);
  };
  const {
    id,
    commenterArtworkUrl,
    content,
    msatAmount,
    name,
    title,
    userId,
    isNostr,
    eventId,
  } = comment;

  const getDisplayName = () => {
    if (isNostr) {
      // use the provided name, else use the npub (set as the userId for nostr comments)
      return name ?? encodeNpub(userId)?.slice(0, 10);
    }

    // keysend names may start with @
    return name ? name.replace("@", "") : "anonymous";
  };

  const extraText = ` for "${title}"`;

  return (
    <View
      style={{
        marginBottom: 16,
        flexDirection: "row",
        paddingHorizontal: 16,
      }}
    >
      <ReplyDialog
        setIsOpen={setDialogOpen}
        comment={comment}
        isOpen={dialogOpen}
      />
      <BasicAvatar
        uri={commenterArtworkUrl}
        pubkey={isNostr ? userId : undefined}
      />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text bold>{getDisplayName()}</Text>
        {content && <Text>{content}</Text>}
        {msatAmount && (
          <SatsEarned
            msats={msatAmount}
            extraText={extraText}
            defaultTextColor
          />
        )}
        {showReplyLinks && eventId && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 20,
              paddingBottom: 10,
              gap: 8,
            }}
          >
            <CommentRepliesLink replies={replies} parentcommentId={id} />
            <TouchableOpacity onPress={onReplyPress}>
              <MaterialCommunityIcons
                name="comment-plus-outline"
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
