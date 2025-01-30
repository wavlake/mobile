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
  const { topLevelReplies, mentions, isFetching, getChildReplies, refetch } =
    useReplies(comment.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const onReplyPress = () => {
    setDialogOpen(true);
  };

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
        isFetching ? <ActivityIndicator /> : <Text>No replies yet</Text>
      }
      // TODO - improve rendering replies and indentation
      contentContainerStyle={{ paddingLeft: LEFT_INDENTATION, paddingTop: 16 }}
      data={topLevelReplies}
      renderItem={({ item }) => (
        <CommentReplyRow reply={item} replies={getChildReplies(item.id)} />
      )}
      ListFooterComponent={<ListFooterComp onReplyPress={onReplyPress} />}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
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
      <CommentRow comment={comment} />
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
