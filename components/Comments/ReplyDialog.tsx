import { DialogWrapper } from "../DialogWrapper";
import { useTheme } from "@react-navigation/native";
import {
  MarqueeText,
  SquareArtwork,
  CancelButton,
  Button,
  TextInput,
  Center,
  CommentRow,
} from "@/components";
import { BottomSheet, ListItem } from "@rneui/themed";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useZap } from "@/hooks";
import { ContentComment } from "@/utils";

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
  const { colors } = useTheme();

  const { defaultZapAmount, title, artist, artworkUrl, trackId, timestamp } =
    useLocalSearchParams<{
      defaultZapAmount: string;
      title: string;
      artist: string;
      artworkUrl: string;
      trackId: string;
      timestamp: string;
    }>();

  const [zapAmount, setZapAmount] = useState(defaultZapAmount ?? "");
  const [comment, setComment] = useState("");
  const { sendZap, isLoading: isZapping } = useZap({
    trackId,
    title,
    artist,
    artworkUrl,
    timestamp: timestamp ? parseInt(timestamp) : 0,
  });
  const isZapDisabled =
    zapAmount.length === 0 || Number(zapAmount) <= 0 || isZapping;
  const handleZap = async () => {
    sendZap({ comment, amount: parseInt(zapAmount), useNavReplace: true });
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
          numberOfLines={3}
          maxLength={312}
          onChangeText={setComment}
          value={comment}
          inputHeight={96}
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
          <Button
            width={100}
            onPress={handleZap}
            disabled={isZapDisabled}
            loading={isZapping}
          >
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
