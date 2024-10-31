import { useTheme } from "@react-navigation/native";
import { BottomSheet } from "@rneui/themed";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useState } from "react";
import { usePublishReply } from "@/hooks/usePublishReply";
import { Event } from "nostr-tools";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { useQueryClient } from "@tanstack/react-query";
import { useRepliesQueryKey } from "@/hooks/useReplies";
import { TextInput } from "../shared/TextInput";
import { CommentRow } from "./CommentRow";
import { Button } from "../shared/Button";

interface ReplyDialogProps {
  commentId: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const ReplyDialog = ({
  setIsOpen,
  commentId,
  isOpen,
}: ReplyDialogProps) => {
  const { data: comment } = useNostrEvent(commentId);

  if (!comment) return null;

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
}: Pick<ReplyDialogProps, "setIsOpen"> & {
  parentComment: Event;
}) => {
  const { save: publishReply } = usePublishReply();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const replyQueryKey = useRepliesQueryKey(parentComment.id);
  const [comment, setComment] = useState("");
  const handleReply = async () => {
    const tags = [
      ["e", parentComment.id, "wss://relay.wavlake.com", "root"],
      ["p", parentComment.pubkey],
    ];
    const replyEvent = await publishReply(comment, tags);
    // update the app cache with the new reply
    queryClient.setQueryData(
      replyQueryKey,
      (oldReplies: Event[] | undefined) => {
        return oldReplies ? [...oldReplies, replyEvent] : [replyEvent];
      },
    );

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
        <CommentRow commentId={parentComment.id} showReplyLinks={false} />
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
