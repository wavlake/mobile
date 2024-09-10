import { ActivityIndicator, FlatList, View } from "react-native";
import { CommentRow } from "./CommentRow";
import { CommentReplyRow } from "./CommentReplyRow";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { ReplyDialog } from "./ReplyDialog";
import { Text } from "@/components/Text";
import { useLocalSearchParams } from "expo-router";
import { Center } from "../Center";
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
  const { data: replies = [] } = useReplies(id);

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

  return <CommentRepliesPageContents comment={comment} replies={replies} />;
};

const CommentRepliesPageContents = ({
  comment,
  replies,
}: {
  comment: Event;
  replies: Event[];
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const onReplyPress = () => {
    setDialogOpen(true);
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
      contentContainerStyle={{ paddingLeft: LEFT_INDENTATION, paddingTop: 16 }}
      data={replies}
      renderItem={({ item }) => <CommentReplyRow reply={item} />}
      ListFooterComponent={<ListFooterComp onReplyPress={onReplyPress} />}
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
