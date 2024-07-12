import { FlatList, View } from "react-native";
import { CommentRow } from "./CommentRow";
import { CommentReplyRow } from "./CommentReplyRow";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { ReplyDialog } from "./ReplyDialog";
import { Text } from "@/components/Text";
import { useCommentId } from "@/hooks/useCommentId";
import { useLocalSearchParams } from "expo-router";
import { Center } from "../Center";

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
  const { data: comment, isLoading } = useCommentId(id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const onReplyPress = () => {
    setDialogOpen(true);
  };

  if (isLoading) return;
  if (!comment) {
    return (
      <Center>
        <Text>Error fetching comment</Text>
      </Center>
    );
  }

  return (
    <FlatList
      ListHeaderComponent={
        <>
          <ReplyDialog
            setIsOpen={setDialogOpen}
            comment={comment}
            isOpen={dialogOpen}
          />
          <CommentRow comment={comment} showReplyLinks={false} />
        </>
      }
      ListHeaderComponentStyle={{
        transform: [{ translateX: -LEFT_INDENTATION }],
      }}
      contentContainerStyle={{ paddingLeft: LEFT_INDENTATION, paddingTop: 16 }}
      data={comment.replies}
      renderItem={({ item }) => <CommentReplyRow reply={item} />}
      ListFooterComponent={
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
      }
    />
  );
};
