import {
  ActivityIndicator,
  FlatList,
  View,
  RefreshControl,
} from "react-native";
import { CommentRow } from "./CommentRow";
import { CommentReplyRow } from "./CommentReplyRow";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { ReplyDialog } from "./ReplyDialog";
import { Text } from "../shared/Text";
import { useLocalSearchParams } from "expo-router";
import { Center } from "../shared/Center";
import { Event } from "nostr-tools";
import { useReplies } from "@/hooks/useReplies";
import { useNostrEvent } from "@/hooks/useNostrEvent";

const LEFT_INDENTATION = 40;

export const CommentRepliesPage = () => {
  // nostr event id
  const { id } = useLocalSearchParams();
  if (typeof id !== "string") {
    return (
      <Center>
        <Text>Invalid comment id</Text>
        <Text>{id}</Text>
      </Center>
    );
  }

  const { data: comment, isLoading } = useNostrEvent(id);

  const { data: replies = [], isFetching, refetch } = useReplies(id);

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

  return (
    <CommentRepliesPageContents
      comment={comment}
      replies={replies}
      isLoading={isFetching}
      refetch={refetch}
    />
  );
};

const CommentRepliesPageContents = ({
  comment,
  replies,
  isLoading,
  refetch,
}: {
  comment: Event;
  replies: Event[];
  isLoading: boolean;
  refetch: () => void;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const onReplyPress = () => {
    setDialogOpen(true);
  };

  const topLevelReplies = replies.filter(
    (reply) =>
      reply.tags.some(
        // must include the root comment event tag
        (tag) => tag.includes("root") && tag.includes(comment.id),
      ) &&
      // must not include the reply event tag
      !reply.tags.some(
        (tag) => tag.includes("reply") && !tag.includes(comment.id),
      ),
  );

  const getReplies = (parent: Event) => {
    return replies.filter(
      (reply) =>
        reply.tags.some(
          // must include the root comment event tag
          (tag) => tag.includes("root") && tag.includes(comment.id),
        ) &&
        // must include the parent event tag
        reply.tags.some(
          (tag) => tag.includes("reply") && tag.includes(parent.id),
        ),
    );
  };

  return (
    <FlatList
      ListHeaderComponent={
        <ListHeaderComp
          commentId={comment.id}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
        />
      }
      ListHeaderComponentStyle={{
        transform: [{ translateX: -LEFT_INDENTATION }],
      }}
      ListEmptyComponent={
        isLoading ? <ActivityIndicator /> : <Text>No replies yet</Text>
      }
      contentContainerStyle={{ paddingLeft: LEFT_INDENTATION, paddingTop: 16 }}
      data={topLevelReplies}
      renderItem={({ item }) => (
        <CommentReplyRow reply={item} replies={getReplies(item)} />
      )}
      ListFooterComponent={<ListFooterComp onReplyPress={onReplyPress} />}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    />
  );
};

const ListHeaderComp = ({
  commentId,
  dialogOpen,
  setDialogOpen,
}: {
  commentId: string;
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
}) => {
  return (
    <>
      <ReplyDialog
        setIsOpen={setDialogOpen}
        commentId={commentId}
        isOpen={dialogOpen}
      />
      <CommentRow commentId={commentId} showReplyLinks={false} />
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
