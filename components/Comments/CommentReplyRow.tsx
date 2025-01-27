import { View, ViewProps } from "react-native";
import { BasicAvatar } from "../BasicAvatar";
import { Text } from "../shared/Text";
import { Event } from "nostr-tools";
import { encodeNpub } from "@/utils";
import { ParsedTextRender } from "./ParsedTextRenderer";
import { useNostrProfile, useReplies } from "@/hooks";
import { CommentActionBar } from "./CommentActionBar";

interface CommentReplyRow extends ViewProps {
  reply: Event;
  replies: Event[];
}

export const CommentReplyRow = ({ reply, replies }: CommentReplyRow) => {
  const { getChildReplies } = useReplies(reply.id);
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
    <>
      <View
        style={{
          marginBottom: 10,
          flexDirection: "row",
          paddingLeft: 16,
          paddingRight: 6,
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
      {/* <CommentActionBar comment={reply} /> */}
      <View
        style={{
          paddingLeft: 16,
        }}
      >
        {replies.map((reply) => (
          <CommentReplyRow
            key={reply.id}
            reply={reply}
            replies={getChildReplies(reply.id)}
          />
        ))}
      </View>
    </>
  );
};
