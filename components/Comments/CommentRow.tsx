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
  showReplyLinks?: boolean;
}
const randomBoolean = () => Math.random() < 0.5;

const genReplies = () => [
  {
    artworkUrl: "https://picsum.photos/200",
    content: "I love this!12",
    msatAmount: 1000,
    name: "Satoshi111",
    userId: "abc",
    id: 1233,
    createdAt: "test",
    parentId: 1234,
    profileUrl: "https://picsum.photos/200",
    isContentOwner: randomBoolean(),
  },
  {
    artworkUrl: "https://picsum.photos/200",
    content: "I love this!124d",
    msatAmount: 1000,
    name: "Satoshi222",
    userId: "abc",
    id: 1234,
    createdAt: "test",
    parentId: 1234,
    profileUrl: "https://picsum.photos/200",
    isContentOwner: false,
  },
  {
    artworkUrl: "https://picsum.photos/200",
    content: "I love this!24",
    name: "Satoshi333",
    userId: "abc",
    id: 1235,
    createdAt: "test",
    parentId: 1234,
    profileUrl: "https://picsum.photos/200",
    isContentOwner: false,
  },
];

export const CommentRow = ({
  comment,
  showReplyLinks = true,
}: CommentRowProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const onLongPress = () => {
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
  } = comment;
  const replies = genReplies();

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
        <TouchableOpacity onLongPress={onLongPress}>
          <Text bold>{getDisplayName()}</Text>
          {content && <Text>{content}</Text>}
          {msatAmount && (
            <SatsEarned
              msats={msatAmount}
              extraText={extraText}
              defaultTextColor
            />
          )}
        </TouchableOpacity>
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
          {showReplyLinks && (
            <CommentRepliesLink replies={replies} parentcommentId={id} />
          )}
          {showReplyLinks && (
            <TouchableOpacity onPress={onLongPress}>
              <MaterialCommunityIcons
                name="comment-plus-outline"
                size={24}
                color="white"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
