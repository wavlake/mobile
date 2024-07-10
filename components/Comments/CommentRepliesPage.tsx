import { FlatList, View } from "react-native";
import { CommentRow } from "./CommentRow";
import { ContentComment } from "@/utils";
import { CommentReplyRow } from "./CommentReplyRow";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { ReplyDialog } from "./ReplyDialog";
import { Text } from "@/components/Text";

const LEFT_INDENTATION = 40;
export const CommentRepliesPage = () => {
  const comment: ContentComment = {
    id: 123,
    contentId: "test",
    title: "test",
    content: "test",
    createdAt: "test",
    msatAmount: 123,
    userId: "test",
    name: "testname",
    commenterArtworkUrl: "https://picsum.photos/200",
    isNostr: true,
    replies: [
      {
        artworkUrl: "https://picsum.photos/200",
        content: "I love this!12",
        msatAmount: 1000,
        name: "Satoshi111",
        userId: "abc",
        id: 1233,
        createdAt: "test",
        parentId: 1234,
        profileUrl: "https://picsum.photos/200",
        isContentOwner: true,
      },
      {
        artworkUrl: "https://picsum.photos/200",
        content: "I love this!124d",
        msatAmount: 1000,
        name: "Satoshi222",
        userId: "abc",
        id: 1234,
        createdAt: "test",
        parentId: 1234,
        profileUrl: "https://picsum.photos/200",
        isContentOwner: true,
      },
      {
        artworkUrl: "https://picsum.photos/200",
        content: "I love this!24",
        name: "Satoshi333",
        userId: "abc",
        id: 1235,
        createdAt: "test",
        parentId: 1234,
        profileUrl: "https://picsum.photos/200",
        isContentOwner: false,
      },
    ],
  };
  const [dialogOpen, setDialogOpen] = useState(false);
  const onReplyPress = () => {
    setDialogOpen(true);
  };

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
