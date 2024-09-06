import { TouchableOpacity, View, ViewProps } from "react-native";
import { BasicAvatar } from "../BasicAvatar";
import { SatsEarned } from "../SatsEarned";
import { Text } from "@/components/Text";
import { CommentRepliesLink } from "./CommentRepliesLink";
import { ReplyDialog } from "./ReplyDialog";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Event, UnsignedEvent } from "nostr-tools";
import { useNostrProfile } from "@/hooks";

interface CommentRowProps extends ViewProps {
  comment: Event;
  replies?: Event[];
  showReplyLinks?: boolean;
}

export const CommentRow = ({
  comment,
  replies = [],
  showReplyLinks = true,
}: CommentRowProps) => {
  const npubMetadata = useNostrProfile(comment.pubkey);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cachedReplies, setCachedReplies] = useState<UnsignedEvent[]>([]);
  const onReplyPress = () => {
    setDialogOpen(true);
  };

  const { picture, name } = npubMetadata || {};
  const { id, content, pubkey } = comment;

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
        setCachedReplies={setCachedReplies}
      />
      <BasicAvatar uri={picture} pubkey={pubkey} />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text bold>{name}</Text>
        <Text>{content}</Text>
        {/* {msatAmount && (
          <SatsEarned
            msats={msatAmount}
            extraText={extraText}
            defaultTextColor
          />
        )} */}
        {showReplyLinks && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingTop: 20,
              paddingBottom: 10,
              gap: 8,
            }}
          >
            <CommentRepliesLink
              replies={[...replies, ...cachedReplies]}
              parentcommentId={id}
            />
            <TouchableOpacity onPress={onReplyPress} style={{}}>
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
