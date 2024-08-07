import { brandColors } from "@/constants";
import { BasicAvatar } from "../BasicAvatar";
import { Text } from "@/components/Text";
import { ContentComment } from "@/utils";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { Event } from "nostr-tools";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";

export const CommentRepliesLink = ({
  legacyReplies,
  nostrReplies,
  parentcommentId,
}: {
  legacyReplies: ContentComment[];
  nostrReplies: Event[];
  parentcommentId: number;
}) => {
  const basePathname = useGetBasePathname();
  const router = useRouter();

  if (legacyReplies.length === 0 && nostrReplies.length === 0) {
    return undefined;
  }

  // TODO - add this flag so we can show the artist profile pic
  // const hasContentOwnerReply = legacyReplies.some(
  //   (reply) => reply.isContentOwner,
  // );
  const numReplies = legacyReplies.length + nostrReplies.length;
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
          {numReplies} {numReplies > 1 ? "replies" : "reply"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
