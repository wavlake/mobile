import { View, ViewProps } from "react-native";
import { BasicAvatar } from "../BasicAvatar";
import { Text } from "../shared/Text";
import { Event, UnsignedEvent } from "nostr-tools";
import { encodeNpub } from "@/utils";
import { ParsedTextRender } from "./ParsedTextRenderer";
import { useNostrProfile } from "@/hooks";

interface CommentReplyRow extends ViewProps {
  reply: Event | UnsignedEvent;
}

export const CommentReplyRow = ({ reply }: CommentReplyRow) => {
  const { content, pubkey } = reply;
  const { data: metadata } = useNostrProfile(pubkey);
  const { name, picture } = metadata || {};

  const getDisplayName = () => {
    try {
      return name ?? encodeNpub(pubkey)?.slice(0, 10);
    } catch (e) {
      console.log("Failed parsing pubkey: ", e);
      return "anonymous";
    }
  };

  return (
    <View
      style={{
        marginBottom: 10,
        flexDirection: "row",
        paddingHorizontal: 16,
        display: "flex",
        alignItems: "flex-start",
      }}
    >
      <BasicAvatar uri={picture} pubkey={pubkey} />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text bold>{getDisplayName()}</Text>
        <ParsedTextRender content={content} />
      </View>
    </View>
  );
};
