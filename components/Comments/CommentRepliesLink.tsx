import { brandColors } from "@/constants";
import { BasicAvatar } from "../BasicAvatar";
import { Text } from "@/components/Text";
import { CommentReply } from "@/utils";
import { Link } from "expo-router";
import { View } from "react-native";
import { Event } from "nostr-tools";

export const CommentRepliesLink = ({
  legacyReplies,
  nostrReplies,
  parentcommentId,
}: {
  legacyReplies: CommentReply[];
  nostrReplies: Event[];
  parentcommentId: number;
}) => {
  if (legacyReplies.length === 0 && nostrReplies.length === 0) {
    return undefined;
  }

  // TODO - add this flag so we can show the artist profile pic
  // const hasContentOwnerReply = legacyReplies.some(
  //   (reply) => reply.isContentOwner,
  // );

  return (
    <Link href={`/comment/${parentcommentId}`}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* {hasContentOwnerReply && (
          <BasicAvatar
            uri={
              legacyReplies.find((reply) => reply.isContentOwner)?.artworkUrl
            }
          />
        )} */}
        <Text
          style={{
            color: brandColors.orange.DEFAULT,
          }}
        >
          {legacyReplies.length}{" "}
          {legacyReplies.length > 1 ? "replies" : "reply"}
        </Text>
      </View>
    </Link>
  );
};
