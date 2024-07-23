import { useTheme } from "@react-navigation/native";
import { Button, TextInput, CommentRow } from "@/components";
import { BottomSheet } from "@rneui/themed";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useState } from "react";
import { useToast } from "@/hooks";
import { ContentComment } from "@/utils";
import { usePublishReply } from "@/hooks/usePublishReply";
import { useSaveLegacyReply } from "@/hooks/useSaveLegacyReply";
import { EventTemplate } from "nostr-tools";

interface ReplyDialogProps {
  comment: ContentComment;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  setCachedReplies?: React.Dispatch<React.SetStateAction<EventTemplate[]>>;
}

export const ReplyDialog = ({
  setIsOpen,
  setCachedReplies,
  comment,
  isOpen,
}: ReplyDialogProps) => {
  return (
    <BottomSheet
      containerStyle={{
        paddingTop: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
      backdropStyle={{ opacity: 0.6, backgroundColor: "black" }}
      isVisible={isOpen}
    >
      <ReplyDialogContents
        setCachedReplies={setCachedReplies}
        setIsOpen={setIsOpen}
        parentComment={comment}
      />
    </BottomSheet>
  );
};

const ReplyDialogContents = ({
  setIsOpen,
  setCachedReplies,
  parentComment,
}: Pick<ReplyDialogProps, "setIsOpen" | "setCachedReplies"> & {
  parentComment: ContentComment;
}) => {
  const toast = useToast();
  const { save: publishReply } = usePublishReply();
  const { mutateAsync: saveLegacyReply } = useSaveLegacyReply();
  const { colors } = useTheme();

  const [comment, setComment] = useState("");
  const handleReply = async () => {
    const parentCommentEventId =
      parentComment.eventId ?? parentComment.zapEventId;
    if (parentCommentEventId) {
      const tags = [
        ["e", parentCommentEventId, "wss://relay.wavlake.com", "root"],
        ["p", parentComment.userId],
      ];
      await publishReply(comment, tags);
      // update the app cache with the new reply
      setCachedReplies?.((prev) => {
        return [
          ...prev,
          {
            kind: 1,
            pubkey: parentComment.userId,
            created_at: Math.floor(Date.now() / 1000),
            tags,
            content: comment,
          },
        ];
      });
    } else {
      await saveLegacyReply({ content: comment, commentId: parentComment.id });
    }
    setIsOpen(false);
  };

  return (
    <KeyboardAvoidingView behavior="position">
      <ScrollView
        contentContainerStyle={{
          paddingVertical: 20,
          paddingHorizontal: 20,
          backgroundColor: colors.background,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <CommentRow comment={parentComment} showReplyLinks={false} />
        <TextInput
          label="reply"
          autoFocus
          multiline
          maxLength={312}
          onChangeText={setComment}
          value={comment}
          inputHeight={70}
        />
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
            width: "100%",
          }}
        >
          <Button width={100} onPress={handleReply}>
            Reply
          </Button>
          <Button
            width={100}
            color={colors.border}
            titleStyle={{
              color: colors.text,
              marginHorizontal: "auto",
            }}
            onPress={() => setIsOpen(false)}
          >
            Close
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
