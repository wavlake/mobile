import { useContentComments } from "@/hooks/useContentComments";
import { CommentRow, Text } from "@/components";
import { brandColors } from "@/constants";
import { ActivityIndicator, Pressable, View } from "react-native";
import { BottomSheet } from "@rneui/base";
import { useState } from "react";
import { CommentList } from "../Comments/CommentList";

export const NowPlayingCommentSection = ({
  contentId,
}: {
  contentId: string;
}) => {
  const { data: commentsData = [], isFetching } = useContentComments(
    contentId,
    20,
  );
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Pressable
      style={{
        backgroundColor: brandColors.black.DEFAULT,
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 8,
        minHeight: 120,
      }}
      onPress={() => {
        setIsExpanded(true);
      }}
    >
      <Text>Latest Messages</Text>
      {isFetching ? (
        <View
          style={{
            paddingTop: 10,
          }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <CommentRow commentId={commentsData[0]} isPressable={false} />
      )}
      <BottomSheet
        onBackdropPress={() => setIsExpanded(false)}
        containerStyle={{
          backgroundColor: brandColors.black.DEFAULT,
          padding: 16,
          paddingTop: 40,
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 8,
        }}
        modalProps={{
          animationType: "slide",
          presentationStyle: "overFullScreen",
        }}
        isVisible={isExpanded}
      >
        <CommentList
          commentIds={commentsData}
          isLoading={isFetching}
          onClose={() => setIsExpanded(false)}
          showReplyLinks={false}
        />
      </BottomSheet>
    </Pressable>
  );
};
