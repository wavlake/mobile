import { Linking, TouchableOpacity, View, ViewProps } from "react-native";
import { BasicAvatar } from "../BasicAvatar";
import { SatsEarned } from "../SatsEarned";
import { Text } from "@/components/Text";
import { CommentRepliesLink } from "./CommentRepliesLink";
import { ReplyDialog } from "./ReplyDialog";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Event, UnsignedEvent } from "nostr-tools";
import { useNostrProfileEvent } from "@/hooks";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { NostrUserProfile } from "@/utils";
import { msatsToSatsWithCommas } from "../WalletLabel";
import { Image } from "expo-image";
import ParsedText from "react-native-parsed-text";
import { brandColors } from "@/constants";

interface CommentRowProps extends ViewProps {
  commentId: string;
  replies?: Event[];
  showReplyLinks?: boolean;
}
const handleUrlPress = (url: string) => {
  Linking.openURL(url);
};

const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

// ParsedText's renderText expects a function that returns a string, but we return an image component
// this works fine, so we just need to cast the return type to any
const renderImage = (matchingString: string, matches: string[]): any => {
  const urlParamsRemoved = matchingString.replace(/(\?|#)\S*/g, "");

  return (
    <Image
      source={{ uri: urlParamsRemoved }}
      placeholder={blurhash}
      style={{ width: 200, height: 200, marginVertical: 10 }}
      cachePolicy="memory-disk"
    />
  );
};

const getCommentText = (
  event: Event,
  npubMetadata?: NostrUserProfile | null,
): string => {
  if (event.content) {
    return event.content;
  }

  if (event.kind === 9734) {
    const amountTag = event.tags.find(([tag]) => tag === "amount");
    if (amountTag) {
      const msatsInt = parseInt(amountTag[1]);
      return isNaN(msatsInt)
        ? ""
        : `Zapped ${msatsToSatsWithCommas(msatsInt)} sats`;
    } else {
      return "";
    }
  }

  return npubMetadata?.name
    ? `${npubMetadata.name} shared this artist's content`
    : "";
};

export const CommentRow = ({
  commentId,
  replies = [],
  showReplyLinks = true,
}: CommentRowProps) => {
  const { data: comment } = useNostrEvent(commentId);
  const { data: npubMetadata } = useNostrProfileEvent(comment?.pubkey);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cachedReplies, setCachedReplies] = useState<UnsignedEvent[]>([]);
  const onReplyPress = () => {
    setDialogOpen(true);
  };

  if (!comment) return null;

  const { picture, name } = npubMetadata || {};
  const { id, content, pubkey, kind } = comment;

  const isZap = kind === 9734;
  // don't render empty comments that arent zaps
  if (content.length === 0 && !isZap) {
    return null;
  }

  const commentText = getCommentText(comment, npubMetadata);

  if (!commentText) {
    return null;
  }
  if (commentText.includes("CALL YOU")) {
    console.log(commentId);
    console.log(commentText);
  }

  return (
    <View
      style={{
        marginBottom: 16,
        flexDirection: "row",
        paddingHorizontal: 16,
      }}
    >
      <ReplyDialog
        setIsOpen={setDialogOpen}
        commentId={commentId}
        isOpen={dialogOpen}
        setCachedReplies={setCachedReplies}
      />
      <BasicAvatar uri={picture} pubkey={pubkey} npubMetadata={npubMetadata} />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text bold>{name}</Text>
        <ParsedText
          style={{ color: "white" }}
          parse={[
            {
              pattern:
                /\bhttps?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\\\s]*|&[^\\\s]*)*/,
              // /\bhttps?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp)(?:\?\S*|#\S*)?/,
              // pattern: /\bhttps?:\/\/\S+\.(?:gif|jpg|jpeg|png)\b/gi,
              style: { color: "blue" },
              renderText: renderImage,
            },
            {
              type: "url",
              style: { color: brandColors.purple.DEFAULT },
              onPress: handleUrlPress,
            },
          ]}
        >
          {commentText}
        </ParsedText>
        {/* {msatAmount && (
          <SatsEarned
            msats={msatAmount}
            extraText={extraText}
            defaultTextColor
          />
        )} */}
        {showReplyLinks && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingTop: 20,
              paddingBottom: 10,
              gap: 8,
            }}
          >
            <CommentRepliesLink
              replies={[...replies, ...cachedReplies]}
              parentcommentId={id}
            />
            <TouchableOpacity onPress={onReplyPress} style={{}}>
              <MaterialCommunityIcons
                name="comment-plus-outline"
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
