import { FlatList, View } from "react-native";
import { CommentRow } from "./CommentRow";
import { CommentReplyRow, LegacyCommentReplyRow } from "./CommentReplyRow";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { ReplyDialog } from "./ReplyDialog";
import { Text } from "@/components/Text";
import { useCommentId } from "@/hooks/useCommentId";
import { useLocalSearchParams } from "expo-router";
import { Center } from "../Center";
import { useReplies } from "@/hooks/useReplies";

const LEFT_INDENTATION = 40;

export const CommentRepliesPage = () => {
  // nostr event id for the kind 1 comment
  const { id } = useLocalSearchParams();
  const parsedInt = parseInt(id as string);
  if (isNaN(parsedInt)) {
    return (
      <Center>
        <Text>Invalid comment id</Text>
        <Text>{id}</Text>
      </Center>
    );
  }

  return <CommentRepliesPageContents id={parsedInt} />;
};

const CommentRepliesPageContents = ({ id }: { id: number }) => {
  const { data: comment, isLoading: commentLoading } = useCommentId(id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const onReplyPress = () => {
    setDialogOpen(true);
  };

  // prefer the kind 1 eventId over the zapEventId
  const { data = [], isLoading: repliesLoading } = useReplies(
    comment?.eventId ?? comment?.zapEventId,
  );
  const isLoading = commentLoading || repliesLoading;
  if (isLoading) return;
  if (!comment) {
    return (
      <Center>
        <Text>Error fetching comment</Text>
      </Center>
    );
  }

  const isLegacyComment = !comment.eventId && !comment.zapEventId;

  return isLegacyComment ? (
    <FlatList
      ListHeaderComponent={
        <ListHeaderComp
          comment={comment}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
        />
      }
      ListHeaderComponentStyle={{
        transform: [{ translateX: -LEFT_INDENTATION }],
      }}
      contentContainerStyle={{ paddingLeft: LEFT_INDENTATION, paddingTop: 16 }}
      data={comment.replies}
      renderItem={({ item }) => <LegacyCommentReplyRow reply={item} />}
      ListFooterComponent={<ListFooterComp onReplyPress={onReplyPress} />}
    />
  ) : (
    <FlatList
      ListHeaderComponent={
        <ListHeaderComp
          comment={comment}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
        />
      }
      ListHeaderComponentStyle={{
        transform: [{ translateX: -LEFT_INDENTATION }],
      }}
      contentContainerStyle={{ paddingLeft: LEFT_INDENTATION, paddingTop: 16 }}
      data={data}
      renderItem={({ item }) => <CommentReplyRow reply={item} />}
      ListFooterComponent={<ListFooterComp onReplyPress={onReplyPress} />}
    />
  );
};

const ListHeaderComp = ({
  comment,
  dialogOpen,
  setDialogOpen,
}: {
  comment: any;
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
}) => {
  return (
    <>
      <ReplyDialog
        setIsOpen={setDialogOpen}
        comment={comment}
        isOpen={dialogOpen}
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
