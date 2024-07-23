import { View, ViewProps } from "react-native";
import { BasicAvatar } from "../BasicAvatar";
import { Text } from "@/components/Text";
import { Event } from "nostr-tools";
import { useCatalogPubkey } from "@/hooks/nostrProfile/useCatalogPubkey";
import { CommentReply, encodeNpub } from "@/utils";

interface CommentReplyRow extends ViewProps {
  reply: Event;
}

export const CommentReplyRow = ({ reply }: CommentReplyRow) => {
  const { content, pubkey } = reply;
  const { data: metadata } = useCatalogPubkey(pubkey);
  const { name, picture } = metadata?.metadata || {};
  const getDisplayName = () => {
    try {
      // use the provided name, else use the npub (set as the userId for nostr comments)
      return name ?? encodeNpub(pubkey)?.slice(0, 10);
    } catch (e) {
      console.log("Failed parsing pubkey: ", e);
      return "anonymous";
    }
  };

  return (
    <View
      style={{
        marginBottom: 36,
        flexDirection: "row",
        paddingHorizontal: 16,
        display: "flex",
        alignItems: "center",
      }}
    >
      <BasicAvatar uri={picture} pubkey={pubkey} />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text bold>{getDisplayName()}</Text>
        {content && <Text>{content}</Text>}
      </View>
    </View>
  );
};

export const LegacyCommentReplyRow = ({ reply }: { reply: CommentReply }) => {
  return (
    <View
      style={{
        marginBottom: 36,
        flexDirection: "row",
        paddingHorizontal: 16,
        display: "flex",
        alignItems: "center",
      }}
    >
      <BasicAvatar uri={reply.artworkUrl} />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text bold>
          {reply.name ? reply.name.replace("@", "") : "anonymous"}
        </Text>
        <Text>{reply.content}</Text>
      </View>
    </View>
  );
};
