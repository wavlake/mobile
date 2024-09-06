import { brandColors } from "@/constants";
import { Text } from "@/components/Text";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { Event, EventTemplate } from "nostr-tools";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";

export const CommentRepliesLink = ({
  replies,
  parentcommentId,
}: {
  replies: Array<Event | EventTemplate>;
  parentcommentId: string;
}) => {
  const basePathname = useGetBasePathname();
  const router = useRouter();

  if (replies.length === 0) {
    return undefined;
  }

  // TODO - add this flag so we can show the artist profile pic
  // const hasContentOwnerReply = legacyReplies.some(
  //   (reply) => reply.isContentOwner,
  // );

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: `${basePathname}/comment/${parentcommentId}`,
          params: { includeBackButton: "true" },
        })
      }
      style={{ flexGrow: 1 }}
    >
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
          {replies.length} {replies.length > 1 ? "replies" : "reply"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
