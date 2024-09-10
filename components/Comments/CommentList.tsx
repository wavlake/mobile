import { CommentRow } from "./CommentRow";
import { useRepliesMap } from "@/hooks/useRepliesMap";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SectionHeader } from "../SectionHeader";
import { Text } from "../Text";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { useRouter } from "expo-router";
import { useNostrComments } from "@/hooks/useNostrComments";

export const CommentList = ({
  contentIds,
  parentContentId,
  parentContentType,
  parentContentTitle,
  scrollEnabled = false,
  showViewMoreLink = true,
}: {
  contentIds: string[];
  parentContentId: string;
  parentContentType?: "artist" | "album" | "podcast";
  parentContentTitle?: string;
  scrollEnabled?: boolean;
  showViewMoreLink?: boolean;
}) => {
  const router = useRouter();
  const { data: comments = [], isFetching } = useNostrComments(
    contentIds,
    parentContentId,
  );

  const { data: repliesMap } = useRepliesMap(comments);
  const basePathname = useGetBasePathname();
  const handleLoadMore = () => {
    if (!parentContentId || !parentContentTitle || !parentContentType) {
      return;
    }
    router.push(
      generateRouterParams({
        parentContentId,
        parentContentType,
        parentContentTitle,
        basePathname,
      }),
    );
  };
  return (
    <FlatList
      ListEmptyComponent={
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: "white",
              textAlign: "center",
            }}
          >
            {isFetching ? <ActivityIndicator /> : "No comment yet"}
          </Text>
        </View>
      }
      data={comments}
      ListHeaderComponent={() => (
        <View>
          <SectionHeader title="Latest Messages" />
        </View>
      )}
      renderItem={({ item, index }) => {
        const replies = item.id ? repliesMap[item.id] ?? [] : [];

        return <CommentRow comment={item} key={item.id} replies={replies} />;
      }}
      keyExtractor={(item) => item.id.toString()}
      ListFooterComponent={
        comments.length > 0 && showViewMoreLink ? (
          <TouchableOpacity onPress={handleLoadMore}>
            <Text style={{ textAlign: "center" }}>View more</Text>
          </TouchableOpacity>
        ) : undefined
      }
      scrollEnabled={scrollEnabled}
    />
  );
};

const generateRouterParams = ({
  parentContentId,
  parentContentType,
  parentContentTitle,
  basePathname,
}: {
  parentContentId: string;
  parentContentType: "artist" | "album" | "podcast";
  parentContentTitle: string;
  basePathname: string;
}) => {
  switch (parentContentType) {
    case "artist":
      return {
        pathname: `${basePathname}/artist/[artistId]/comments`,
        params: {
          artistId: parentContentId,
          headerTtle: `Comments for ${parentContentTitle}`,
          includeBackButton: "true",
        },
      };
    case "album":
      return {
        pathname: `${basePathname}/album/[albumId]/comments`,
        params: {
          albumId: parentContentId,
          headerTitle: `Comments for ${parentContentTitle}`,
          includeBackButton: "true",
        },
      };
    case "podcast":
      return {
        pathname: `${basePathname}/artist/[artistId]/comments`,
        params: {
          podcastId: parentContentId,
          headerTitle: `Comments for ${parentContentTitle}`,
          includeBackButton: "true",
        },
      };
  }
};
