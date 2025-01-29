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

const sampleZapReceipt = {
  content: "",
  created_at: 1737653643,
  id: "5a3ca803898e5a67ba2c0f1c5cdbe02d3e6665479b985a873c1fa0f46836d210",
  kind: 9735,
  pubkey: "7759fb24cec56fc57550754ca8f6d2c60183da2537c8f38108fdf283b20a0e58",
  sig: "9874bf600c200dbc128ea1c4144482761fe156bd7569d59f96cccd848e82e15e0e1bdbb91f5324578599e22ca9314369ee565b50751526792c093217f6e4eaf6",
  tags: [
    [
      "bolt11",
      "lnbc50u1pneyltjpp5pt20u4mxyk2l0es7xqggg0kfwz9u7k3yxlxg30450ttrdk065jhqdpg2ashvmrpddjjqmrww4exctt6v9czqer9wphhx6t5cqzzsxqrrsssp5yk5qc8wc5ykwqxpen5vg0hxt9rmvfg74ydxgm5hvq75rl52ymvdq9p4gqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqysgqmcd9tqlzjqr9all5uafgw2hj75rvczu4tdu6vdc3vzeg6cedstj9k7er83uwxxwgea0ky83rddx3psx7tv0czdv37lxl9m4k0vuj9dgpzntqcp",
    ],
    [
      "description",
      '{"kind":9734,"created_at":1737653618,"content":"","tags":[["p","93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535"],["relays","wss://relay.damus.io/","wss://nos.lol/","wss://nostr.bitcoiner.social/"],["amount","5000000"],["e","8b78d6de6dbcbd1cd6572f6c4474e8822878f2d64a741e7c019c7298f58d2195"]],"pubkey":"745eb529d0e42d2fa6c904bbc2c10702deae964b4dd3079803ab8b43536dda12","id":"3a5de0002b05adac2821b42e75e58209e734c5c028c95701890eda2a2b7bd5bd","sig":"1ea8d1c82a0b36b1959e000837cd1541713e73d611e676e94e05ef5f861e1e575625f977238106499f1054419add722bbe30122f5a147fc17062cc4436f008e1"}',
    ],
    [
      "preimage",
      "90ee39f053846515fd83754d3f5c8ea3f6d607c77d1e7107dfe0b10e63d847a2",
    ],
    ["p", "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535"],
    ["e", "8b78d6de6dbcbd1cd6572f6c4474e8822878f2d64a741e7c019c7298f58d2195"],
  ],
};
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
  const { refetch, reposts, reactions, zapsReceipts, replies, genericReposts } =
    useEventRelatedEvents(comment);
  const zapTotal = zapsReceipts.reduce((acc, zap) => {
    try {
      const zapRequest: Event = JSON.parse(zap.content);
      console.log(zapRequest.tags);
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
          rightLabel={zapTotal.toString()}
        >
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={20}
            color={colors.text}
          />
        </PressableIcon>

        <PressableIcon
          onPress={handleReactionPress}
          onLongPress={() => setReactionDialogOpen(true)}
          rightLabel={
            reactions.length > 0 ? reactions.length.toString() : undefined
          }
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
