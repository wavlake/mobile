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
import { UnsignedEvent, Event } from "nostr-tools";
import { useQuery } from "@tanstack/react-query";
import { fetchReplies, getEventById } from "@/utils";
import { useRepliesQueryKey } from "@/hooks/useReplies";
import { getNostrCommentsQueryKey } from "@/hooks/useNostrComments";

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

  const replyQueryKey = useRepliesQueryKey(id);
  const { data: replies = [] } = useQuery({
    queryKey: replyQueryKey,
    queryFn: () => fetchReplies([id]),
  });

  const commentQueryKey = getNostrCommentsQueryKey(id);
  const { data: comment, isLoading } = useQuery({
    queryKey: commentQueryKey,
    queryFn: () => getEventById(id),
  });

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
  const [cachedReplies, setCachedReplies] = useState<UnsignedEvent[]>([]);
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
          setCachedReplies={setCachedReplies}
        />
      }
      ListHeaderComponentStyle={{
        transform: [{ translateX: -LEFT_INDENTATION }],
      }}
      contentContainerStyle={{ paddingLeft: LEFT_INDENTATION, paddingTop: 16 }}
      data={[...replies, ...cachedReplies]}
      renderItem={({ item }) => <CommentReplyRow reply={item} />}
      ListFooterComponent={<ListFooterComp onReplyPress={onReplyPress} />}
    />
  );
};

const ListHeaderComp = ({
  comment,
  dialogOpen,
  setDialogOpen,
  setCachedReplies,
}: {
  comment: any;
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
  setCachedReplies?: React.Dispatch<React.SetStateAction<UnsignedEvent[]>>;
}) => {
  return (
    <>
      <ReplyDialog
        setIsOpen={setDialogOpen}
        comment={comment}
        isOpen={dialogOpen}
        setCachedReplies={setCachedReplies}
      />
      <CommentRow comment={comment} showReplyLinks={false} />
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
