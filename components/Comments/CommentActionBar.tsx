import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { Event } from "nostr-tools";
import { brandColors } from "@/constants";
import { useReplies } from "@/hooks/useReplies";
import { useReactions } from "@/hooks/useReactions";
import { DialogWrapper } from "../DialogWrapper";
import { useReposts, useZapEvent } from "@/hooks";
import { PressableIcon } from "../PressableIcon";
import { useEventRelatedEvents } from "@/hooks/useEventRelatedEvents";

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
  const {
    refetch,
    reposts,
    reactions,
    zapsReceipts,
    replies,
    genericReposts,
    userHasReacted,
  } = useEventRelatedEvents(comment);

  const zapTotal = zapsReceipts.reduce((acc, zap) => {
    try {
      const zapRequest: Event = JSON.parse(zap.content);
      const [amountTag, amount] =
        zapRequest.tags.find((tag) => tag[0] === "amount") ?? [];
      return acc + parseInt(amount);
    } catch (e) {
      return acc;
    }
  }, 0);

  const { reactToEvent } = useReactions(comment);
  const { repostEvent } = useReposts(comment);

  const handleReplyPress = () => {
    router.push(`/comment/${comment.id}`);
  };

  const handleZapPress = () => {
    // sendZap({ amount: 1000 })
  };

  const handleReactionPress = () => {
    reactToEvent("+");
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
            topLevelReplies.length > 0
              ? topLevelReplies.length.toString()
              : undefined
          }
        >
          <MaterialCommunityIcons
            name="chat-outline"
            size={20}
            color={colors.text}
          />
        </PressableIcon>

        <PressableIcon
          onPress={handleZapPress}
          rightLabel={zapTotal > 0 ? zapTotal.toString() : undefined}
        >
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={20}
            color={colors.text}
          />
        </PressableIcon>

        <PressableIcon
          onPress={userHasReacted ? undefined : handleReactionPress}
          onLongPress={() => setReactionDialogOpen(true)}
          rightLabel={
            reactions.length > 0 ? reactions.length.toString() : undefined
          }
        >
          <MaterialCommunityIcons
            name={userHasReacted ? "heart" : "heart-outline"}
            size={20}
            color={userHasReacted ? brandColors.pink.DEFAULT : colors.text}
          />
        </PressableIcon>

        <PressableIcon
          onPress={handleQuotePress}
          rightLabel={
            reposts.length > 0 ? reposts.length.toString() : undefined
          }
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
