import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { Event } from "nostr-tools";
import { Text } from "../shared/Text";
import { brandColors } from "@/constants";
import { useReplies } from "@/hooks/useReplies";
import { useReactions } from "@/hooks/useReactions";
import { DialogWrapper } from "../DialogWrapper";
import { useReposts, useZapEvent } from "@/hooks";
import { PressableIcon } from "../PressableIcon";

interface CommentActionBarProps {
  comment: Event;
  contentId?: string;
}

export const CommentActionBar = ({
  comment,
  contentId,
}: CommentActionBarProps) => {
  const router = useRouter();
  const { colors } = useTheme();
  const [reactionDialogOpen, setReactionDialogOpen] = useState(false);

  const { topLevelReplies } = useReplies(comment.id);
  const { sendZap } = useZapEvent({
    isPodcast: false,
    trackId: contentId,
    parentContentId: comment.id,
  });
  const { reactToEvent, reactions } = useReactions(comment);
  const { repostEvent, quoteReposts, reposts } = useReposts(comment);

  const handleReplyPress = () => {
    router.push(`/comment/${comment.id}`);
  };

  const handleZapPress = () => {
    // sendZap({ amount: 1000 })
  };

  const handleReactionPress = () => {
    reactToEvent("❤️");
  };

  const handleQuotePress = () => {
    // repostEvent();
  };

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 8,
          paddingHorizontal: 16,
          gap: 24,
        }}
      >
        <PressableIcon
          onPress={handleReplyPress}
          rightLabel={
            topLevelReplies.length > 0 ? topLevelReplies.length : undefined
          }
        >
          <MaterialCommunityIcons
            name="chat-outline"
            size={20}
            color={colors.text}
          />
          <Text>{topLevelReplies.length}</Text>
        </PressableIcon>

        <PressableIcon onPress={handleZapPress} rightLabel={12345}>
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={20}
            color={colors.text}
          />
        </PressableIcon>

        <PressableIcon
          onPress={handleReactionPress}
          onLongPress={() => setReactionDialogOpen(true)}
          rightLabel={reactions.length > 0 ? reactions.length : undefined}
        >
          <MaterialCommunityIcons
            name={reactions.length > 0 ? "heart" : "heart-outline"}
            size={20}
            color={
              reactions.length > 0 ? brandColors.pink.DEFAULT : colors.text
            }
          />
        </PressableIcon>

        <PressableIcon
          onPress={handleQuotePress}
          rightLabel={reposts.length > 0 ? reposts.length : undefined}
        >
          <MaterialCommunityIcons
            name="recycle"
            size={20}
            color={colors.text}
          />
        </PressableIcon>

        {/* <PressableIcon onPress={handleBookmarkPress}>
          <MaterialCommunityIcons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={colors.text}
          />
        </PressableIcon> */}
      </View>

      <DialogWrapper
        isOpen={reactionDialogOpen}
        setIsOpen={setReactionDialogOpen}
      >
        {/* Reaction picker dialog content */}
      </DialogWrapper>
    </>
  );
};
