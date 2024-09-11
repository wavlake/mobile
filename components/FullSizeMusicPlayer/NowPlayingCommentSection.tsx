import { useContentComments } from "@/hooks/useContentComments";
import { CommentRow, SectionHeader, Text } from "@/components";
import { brandColors } from "@/constants";
import { ActivityIndicator, Pressable, View } from "react-native";
import { BottomSheet } from "@rneui/base";
import { useEffect, useRef, useState } from "react";
import { CommentList } from "../Comments/CommentList";
import { ArrowTopRightOnSquareIcon } from "react-native-heroicons/solid";

const COMMENT_ROTATION_INTERVAL = 5000;
export const NowPlayingCommentSection = ({
  contentId,
}: {
  contentId: string;
}) => {
  const { data: commentsData = [], isFetching } = useContentComments(
    contentId,
    20,
  );
  const [displayedComment, setDisplayedComment] = useState<string>();
  const [isExpanded, setIsExpanded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (commentsData.length === 0) {
      setDisplayedComment(undefined);
      return;
    }

    setDisplayedComment(commentsData[0]);

    let i = 0;
    intervalRef.current = setInterval(() => {
      i = (i + 1) % commentsData.length;
      setDisplayedComment(commentsData[i]);
    }, COMMENT_ROTATION_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [commentsData, contentId]);

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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 18 }} bold>
          Latest Messages
        </Text>
        <ArrowTopRightOnSquareIcon
          color={brandColors.beige.dark}
          height={20}
          width={20}
        />
      </View>

      {isFetching ? (
        <View
          style={{
            paddingTop: 10,
          }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        displayedComment && (
          <CommentRow commentId={displayedComment} isPressable={false} />
        )
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
