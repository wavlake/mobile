import { ContentComment, encodeNpub } from "@/utils";
import { View, ViewProps } from "react-native";
import { BasicAvatar } from "./BasicAvatar";
import { SatsEarned } from "./SatsEarned";
import { Text } from "@/components/Text";

interface CenterProps extends ViewProps {
  comment: Omit<ContentComment, "id">;
}

export const CommentRow = ({ comment }: CenterProps) => {
  const {
    commenterArtworkUrl,
    content,
    msatAmount,
    name,
    title,
    userId,
    isNostr,
  } = comment;
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
        <SatsEarned msats={msatAmount} extraText={extraText} defaultTextColor />
      </View>
    </View>
  );
};
