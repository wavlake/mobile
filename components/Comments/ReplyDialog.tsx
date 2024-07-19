import { useTheme } from "@react-navigation/native";
import { Button, TextInput, CommentRow } from "@/components";
import { BottomSheet } from "@rneui/themed";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useState } from "react";
import { useToast } from "@/hooks";
import { ContentComment } from "@/utils";
import { usePublishReply } from "@/hooks/usePublishReply";
import { useSaveLegacyReply } from "@/hooks/useSaveLegacyReply";

interface ReplyDialogProps {
  comment: ContentComment;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const ReplyDialog = ({
  setIsOpen,
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
      <ReplyDialogContents setIsOpen={setIsOpen} parentComment={comment} />
    </BottomSheet>
  );
};

const ReplyDialogContents = ({
  setIsOpen,
  parentComment,
}: {
  setIsOpen: (value: boolean) => void;
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
      await publishReply(comment, [
        ["e", parentCommentEventId, "wss://relay.wavlake.com"],
        ["p", parentComment.userId],
      ]);
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
