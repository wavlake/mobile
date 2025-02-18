import { useTheme } from "@react-navigation/native";
import { BottomSheet } from "@rneui/themed";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useState } from "react";
import { usePublishReply } from "@/hooks/usePublishReply";
import { Event } from "nostr-tools";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { useQueryClient } from "@tanstack/react-query";
import { TextInput } from "../shared/TextInput";
import { CommentContent } from "./CommentContent";
import { Button } from "../shared/Button";
import { useDecodedProfile } from "@/hooks";
import { nostrQueryKeys } from "@/providers";

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
  const replyQueryKey = nostrQueryKeys.eTagReplies(parentComment.id);
  const [comment, setComment] = useState("");
  const { data: profile, isLoading: metadataIsLoading } = useDecodedProfile(
    parentComment?.pubkey,
  );

  const parentCommentId = parentComment.id;
  const [tag, rootEventId, relay, replyType] =
    parentComment.tags.find(
      ([tag, eventId, relay, replyType]) => tag === "e" && replyType === "root",
    ) || [];

  const handleReply = async () => {
    const tags = [
      ["e", rootEventId ?? parentCommentId, relay, "root"],
      ...(rootEventId ? [["e", parentCommentId, relay, "reply"]] : []),
      ["p", parentComment.pubkey],
    ];
    const replyEvent = await publishReply(comment, tags);
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
        <CommentContent
          comment={parentComment}
          npubMetadata={profile}
          metadataIsLoading={metadataIsLoading}
        />
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
