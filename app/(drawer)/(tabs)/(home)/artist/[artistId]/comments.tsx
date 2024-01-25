import {
  Text,
  CommentRow,
  SectionHeader,
  useMiniMusicPlayer,
} from "@/components";
import { getArtist, getArtistComments } from "@/utils";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { FlatList, ScrollView, TouchableOpacity, View } from "react-native";

const PAGE_SIZE = 10;
const ArtistCommentPage = () => {
  const { height } = useMiniMusicPlayer();
  const { artistId } = useLocalSearchParams();
  const { data: artist } = useQuery({
    queryKey: [artistId],
    queryFn: () => getArtist(artistId as string),
  });
  const isVerified = artist?.verified ?? false;
  const router = useRouter();
  useEffect(() => {
    if (isVerified) {
      router.setParams({ includeHeaderTitleVerifiedBadge: "1" });
    }
  }, [isVerified]);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [artistId, "comments"],
    queryFn: ({ pageParam = 1 }) =>
      getArtistComments(artistId as string, pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage =
        lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined;
      return undefined;
    },
  });
  const { pages = [] } = data ?? {};
  const flattenedData = pages.flatMap((page) => page ?? []);
  return (
    <View
      style={{ height: "100%", paddingTop: 16, paddingBottom: height + 16 }}
    >
      <FlatList
        data={flattenedData}
        ListHeaderComponent={() => (
          <View>
            <SectionHeader title="Comments" />
          </View>
        )}
        renderItem={({ item, index }) => (
          <CommentRow comment={item} key={item.id} />
        )}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled
      />
    </View>
  );
};

export { ArtistCommentPage as default };
