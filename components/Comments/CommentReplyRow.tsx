import { View, ViewProps } from "react-native";
import { BasicAvatar } from "../BasicAvatar";
import { Text } from "@/components/Text";
import { Event, UnsignedEvent } from "nostr-tools";
import { useCatalogPubkey } from "@/hooks/nostrProfile/useCatalogPubkey";
import { ContentComment, encodeNpub } from "@/utils";

interface CommentReplyRow extends ViewProps {
  reply: Event | UnsignedEvent;
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
        marginBottom: 26,
        flexDirection: "row",
        paddingHorizontal: 16,
        display: "flex",
        alignItems: "flex-start",
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
