import React, { useEffect, useRef, useState } from "react";
import { useContentComments } from "@/hooks/useContentComments";
import { CommentRow, Text } from "@/components";
import { brandColors } from "@/constants";
import { ActivityIndicator, Pressable, View, Animated } from "react-native";
import { BottomSheet } from "@rneui/base";
import { CommentList } from "../Comments/CommentList";
import { ArrowTopRightOnSquareIcon } from "react-native-heroicons/solid";

const COMMENT_ROTATION_INTERVAL = 5000;

export const NowPlayingCommentSection = ({
  contentId,
}: {
  contentId: string;
}) => {
  const { data: commentsData = [], isFetching } = useContentComments(contentId);
  const [displayedComment, setDisplayedComment] = useState<string>();
  const [isExpanded, setIsExpanded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

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

  const showCommentPreview = !isFetching && displayedComment;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showCommentPreview ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showCommentPreview, slideAnim]);

  const slideInterpolate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust this value based on your component's height
  });

  return (
    <>
      <Animated.View
        style={{
          transform: [{ translateY: slideInterpolate }],
          opacity: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        }}
      >
        {showCommentPreview && (
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
            <CommentRow commentId={displayedComment} isPressable={false} />
          </Pressable>
        )}
      </Animated.View>
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
    </>
  );
};
