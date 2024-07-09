import { FlatList } from "react-native";
import { CommentRow } from "./CommentRow";
import { ContentComment } from "@/utils";
import { CommentReplyRow } from "./CommentReplyRow";

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

  return (
    <FlatList
      ListHeaderComponent={
        <CommentRow comment={comment} showReplyLink={false} />
      }
      ListHeaderComponentStyle={{
        transform: [
          {
            translateX: -40,
          },
        ],
      }}
      contentContainerStyle={{ paddingLeft: 40, paddingTop: 16 }}
      data={comment.replies}
      renderItem={({ item }) => <CommentReplyRow reply={item} />}
    />
  );
};
