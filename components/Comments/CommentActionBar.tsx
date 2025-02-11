import { ActivityIndicator, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { Event } from "nostr-tools";
import { brandColors } from "@/constants";
import { useReactions } from "@/hooks/useReactions";
import { DialogWrapper } from "../DialogWrapper";
import { useReposts, useToast, useZapEvent } from "@/hooks";
import { PressableIcon } from "../PressableIcon";
import { Button, ShareButton, TextInput } from "../shared";
import Feather from "@expo/vector-icons/Feather";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { getParentEventId } from "@/utils";
import { satsFormatter } from "../WalletLabel";

interface CommentActionBarProps {
  comment: Event;
  contentId?: string;
  replies: Event[];
  reactions: Event[];
  reposts: Event[];
  genericReposts: Event[];
  userHasReacted: boolean;
  userHasZapped: number;
  zapReceipts: Event[];
  zapTotal: number;
}

interface ZapFormState {
  amount: string;
  comment: string;
  errors: {
    amount?: string;
    comment?: string;
  };
}
const initialFormState: ZapFormState = {
  amount: "",
  comment: "",
  errors: {},
};

export const CommentActionBar = ({
  comment,
  contentId,
  replies,
  reactions,
  reposts,
  userHasReacted,
  userHasZapped,
  zapTotal,
}: CommentActionBarProps) => {
  const toast = useToast();
  const basePathname = useGetBasePathname();
  const router = useRouter();
  const { colors } = useTheme();
  const [reactionDialogOpen, setReactionDialogOpen] = useState(false);
  const [zapDialogOpen, setZapDialogOpen] = useState(false);
  const {
    sendZap,
    isLoading: zapInProgress,
    isSuccess: zapSuccess,
  } = useZapEvent();

  const { reactToEvent } = useReactions(comment);
  const { repostEvent } = useReposts(comment);

  const handleReplyPress = () => {
    const rootEventId = getParentEventId(comment);
    if (rootEventId) {
      router.push(`${basePathname}/comment/${rootEventId}`);
    }
  };
  const [formState, setFormState] = useState<ZapFormState>(initialFormState);

  const updateFormField = <K extends keyof ZapFormState>(
    field: K,
    value: ZapFormState[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined, // Clear specific field error
      },
    }));
  };

  const handleZap = () => {
    const amountInSats = parseInt(formState.amount);

    if (isNaN(amountInSats) || amountInSats <= 0) {
      toast.show("Zap amount must be a positive integer");
      return;
    }

    sendZap({ event: comment, amountInSats, comment: formState.comment });
    setZapDialogOpen(false);
  };

  const handleReactionPress = () => {
    // TODO - support multiple reactions/emojis
    if (userHasReacted) {
      toast.show("You've already reacted to this comment");
      return;
    }
    reactToEvent("+");
  };

  const handleQuotePress = () => {
    toast.show("Repost feature is not yet implemented");
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
            replies.length > 0 ? replies.length.toString() : undefined
          }
        >
          <MaterialCommunityIcons
            name="chat-outline"
            size={20}
            color={colors.text}
          />
        </PressableIcon>

        <PressableIcon
          onPress={() => setZapDialogOpen(true)}
          rightLabel={zapTotal > 0 ? satsFormatter(zapTotal * 1000) : undefined}
        >
          {zapInProgress ? (
            <ActivityIndicator size="small" />
          ) : zapSuccess ? (
            <MaterialCommunityIcons
              name="check"
              size={20}
              color={brandColors.mint.DEFAULT}
            />
          ) : (
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={20}
              color={userHasZapped ? brandColors.orange.DEFAULT : colors.text}
            />
          )}
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
          <Feather name="repeat" size={20} color={colors.text} />
        </PressableIcon>

        {/* <PressableIcon onPress={handleBookmarkPress}>
          <MaterialCommunityIcons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={colors.text}
          />
        </PressableIcon> */}
        <ShareButton url={`njump.me/${comment.id}`} size={20} />
      </View>

      <DialogWrapper
        isOpen={reactionDialogOpen}
        setIsOpen={setReactionDialogOpen}
      >
        {/* Reaction picker dialog content */}
      </DialogWrapper>
      <DialogWrapper isOpen={zapDialogOpen} setIsOpen={setZapDialogOpen}>
        <TextInput
          label="Amount"
          keyboardType="numeric"
          autoCorrect={false}
          value={formState.amount}
          onChangeText={(value) => updateFormField("amount", value)}
          errorMessage={formState.errors.amount}
        />
        <TextInput
          label="Comment (optional)"
          autoCorrect={false}
          value={formState.comment}
          onChangeText={(value) => updateFormField("comment", value)}
          errorMessage={formState.errors.comment}
        />
        <View
          style={{
            paddingTop: 16,
            gap: 16,
            marginHorizontal: "auto",
          }}
        >
          <Button onPress={handleZap}>Zap</Button>
          <Button onPress={() => setZapDialogOpen(false)} color="white">
            Cancel
          </Button>
        </View>
      </DialogWrapper>
    </>
  );
};
