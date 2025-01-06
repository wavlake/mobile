import { useLocalSearchParams, useRouter } from "expo-router";
import { Dimensions, FlatList, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Album, getAlbum, getAlbumTracks, Track } from "@/utils";
import { Text } from "./shared/Text";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { ContentPageButtons } from "./ContentPageButtons";
import { TrackRow } from "./TrackRow";
import { SectionHeader } from "./SectionHeader";
import { SquareArtwork } from "./SquareArtwork";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { CommentList } from "./Comments/CommentList";
import { useAlbumComments } from "@/hooks/useAlbumComments";
import LoadingScreen from "./LoadingScreen";
import { Center } from "./shared/Center";

interface AlbumPageFooterProps {
  album: Album;
  tracks: Track[];
}

const AlbumPageFooter = ({ album, tracks }: AlbumPageFooterProps) => {
  const { description, topMessages = [], title, id: albumId } = album;
  const basePathname = useGetBasePathname();
  const router = useRouter();
  const { data: commentIds = [], isFetching } = useAlbumComments(albumId, 10);
  if (!description && topMessages.length === 0) {
    return null;
  }

  return (
    <View style={{ marginTop: 16, marginBottom: 80, paddingHorizontal: 16 }}>
      {description && (
        <>
          <SectionHeader title="About" />
          <Text style={{ fontSize: 18 }}>{description}</Text>
        </>
      )}
      <CommentList
        commentIds={commentIds}
        isLoading={isFetching}
        showMoreLink={{
          pathname: `${basePathname}/album/[albumId]/comments`,
          params: {
            albumId,
            headerTitle: `Comments for ${album.title}`,
            includeBackButton: "true",
          },
        }}
      />
    </View>
  );
};

export const AlbumPage = () => {
  const { loadTrackList } = useMusicPlayer();
  const { albumId } = useLocalSearchParams();
  const { data: album } = useQuery({
    queryKey: [albumId],
    queryFn: () => getAlbum(albumId as string),
  });

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ["albums", albumId],
    queryFn: () => getAlbumTracks(albumId as string),
  });
  const screenWidth = Dimensions.get("window").width;
  const handleRowPress = async (index: number, playerTitle: string) => {
    await loadTrackList({
      trackList: tracks,
      trackListId: albumId as string,
      startIndex: index,
      playerTitle,
    });
  };

  if (isLoading) {
    return <LoadingScreen loading />;
  }

  if (!album) {
    return (
      <Center>
        <Text>Album not found</Text>
      </Center>
    );
  }

  return (
    <FlatList
      data={tracks}
      ListHeaderComponent={() => {
        if (!album) {
          return null;
        }

        const { id, title, artworkUrl } = album;

        return (
          <View style={{ marginBottom: 36 }}>
            <SquareArtwork size={screenWidth} url={artworkUrl} />
            <ContentPageButtons
              type="album"
              shareUrl={`https://wavlake.com/album/${albumId}`}
              content={album}
              trackListId={id}
              trackListTitle={title}
              onPlay={handleRowPress}
            />
          </View>
        );
      }}
      renderItem={({ item, index }) => {
        const { albumTitle, artist } = item;
        const isLastItem = index === tracks.length - 1;

        return (
          <View style={{ marginBottom: isLastItem ? 0 : 16 }}>
            <TrackRow
              track={item}
              descriptor={artist}
              showArtwork={false}
              onPress={() => handleRowPress(index, albumTitle)}
            />
          </View>
        );
      }}
      ListFooterComponent={() =>
        album ? <AlbumPageFooter album={album} tracks={tracks} /> : null
      }
      keyExtractor={(item) => item.id}
      style={{ paddingTop: 8 }}
    />
  );
};
