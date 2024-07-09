import { ContentComment, encodeNpub } from "@/utils";
import { View, ViewProps } from "react-native";
import { BasicAvatar } from "./BasicAvatar";
import { SatsEarned } from "./SatsEarned";
import { Text } from "@/components/Text";
import { CommentRepliesLink } from "./CommentRepliesLink";

interface CommentRowProps extends ViewProps {
  comment: ContentComment;
  showReplyLink?: boolean;
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
  showReplyLink = true,
}: CommentRowProps) => {
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
    return name?.replace("@", "");
  };

  const extraText = `from @${getDisplayName() ?? "anon"} for "${title}"`;

  return (
    <View
      style={{
        marginBottom: 16,
        flexDirection: "row",
        paddingHorizontal: 16,
      }}
    >
      <BasicAvatar
        uri={commenterArtworkUrl}
        pubkey={isNostr ? userId : undefined}
      />
      <View style={{ marginLeft: 10, flex: 1 }}>
        {content && <Text bold>{content}</Text>}
        {msatAmount && (
          <SatsEarned
            msats={msatAmount}
            extraText={extraText}
            defaultTextColor
          />
        )}
        {showReplyLink && (
          <CommentRepliesLink replies={replies} parentcommentId={id} />
        )}
      </View>
    </View>
  );
};
