import {
  ActivityIndicator,
  FlatList,
  View,
  RefreshControl,
} from "react-native";
import { CommentRow } from "./CommentRow";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { memo, useCallback, useState } from "react";
import { ReplyDialog } from "./ReplyDialog";
import { Text } from "../shared/Text";
import { useLocalSearchParams } from "expo-router";
import { Center } from "../shared/Center";
import { Event } from "nostr-tools";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { useEventRelatedEvents } from "@/hooks/useEventRelatedEvents";

const LEFT_INDENTATION = 40;

export const CommentRepliesPage = () => {
  // nostr event id
  const { id } = useLocalSearchParams();
  const { data: comment, isLoading } = useNostrEvent(id as string);
  if (typeof id !== "string") {
    return (
      <Center>
        <Text>Invalid comment id</Text>
        <Text>{id}</Text>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center>
        <ActivityIndicator />
      </Center>
    );
  }

  if (!comment) {
    return (
      <Center>
        <Text>Comment not found</Text>
        <Text>{id}</Text>
      </Center>
    );
  }

  return <CommentRepliesPageContents comment={comment} />;
};

const CommentRepliesPageContents = ({ comment }: { comment: Event }) => {
  const { directReplies, refetch, isLoading } = useEventRelatedEvents(comment);
  const [dialogOpen, setDialogOpen] = useState(false);
  const onReplyPress = () => {
    setDialogOpen(true);
  };
  const MemoizedCommentRow = memo(CommentRow);
  const renderItem = useCallback(({ item: event }: { item: Event }) => {
    return <MemoizedCommentRow comment={event} key={event.id} />;
  }, []);

  return (
    <FlatList
      ListHeaderComponent={
        <ListHeaderComp
          comment={comment}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
        />
      }
      ListHeaderComponentStyle={{
        // TODO - improve rendering replies and indentation
        transform: [{ translateX: -LEFT_INDENTATION }],
      }}
      ListEmptyComponent={
        isLoading ? (
          <ActivityIndicator />
        ) : comment.kind === 1 ? (
          <Text>No replies yet</Text>
        ) : null
      }
      // TODO - improve rendering replies and indentation
      contentContainerStyle={{ paddingLeft: LEFT_INDENTATION, paddingTop: 16 }}
      data={directReplies}
      renderItem={renderItem}
      ListFooterComponent={
        comment.kind === 1 ? (
          <ListFooterComp onReplyPress={onReplyPress} />
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    />
  );
};

const ListHeaderComp = ({
  comment,
  dialogOpen,
  setDialogOpen,
}: {
  comment: Event;
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
}) => {
  return (
    <>
      <ReplyDialog
        setIsOpen={setDialogOpen}
        commentId={comment.id}
        isOpen={dialogOpen}
      />
      <CommentRow comment={comment} showReplyParent />
    </>
  );
};

const ListFooterComp = ({ onReplyPress }: { onReplyPress: () => void }) => {
  return (
    <TouchableOpacity onPress={onReplyPress}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingHorizontal: 20,
          gap: 10,
        }}
      >
        <Text>reply</Text>
        <MaterialCommunityIcons
          name="comment-plus-outline"
          size={24}
          color="white"
        />
      </View>
    </TouchableOpacity>
  );
};
