import {
  Dimensions,
  FlatList,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Text } from "@/components/Text";
import { useDebounce, useGoToAlbumPage, useGoToArtistPage } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { search, SearchResult } from "@/utils";
import { SquareArtwork } from "@/components/SquareArtwork";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";

const SearchResultRow = ({
  artworkUrl,
  name,
  type,
  id,
  liveUrl,
  artist,
  artistId,
  avatarUrl,
  albumId,
  albumTitle,
  duration,
}: SearchResult) => {
  const { colors } = useTheme();
  const { loadTrackList } = useMusicPlayer();
  const goToAlbumPage = useGoToAlbumPage();
  const goToArtistPage = useGoToArtistPage();
  const handleRowPress = async () => {
    if (
      type === "track" &&
      liveUrl &&
      artist &&
      duration &&
      artistId &&
      albumId &&
      albumTitle &&
      artworkUrl
    ) {
      return await loadTrackList({
        trackList: [
          {
            id,
            liveUrl,
            artworkUrl,
            title: name,
            artist,
            artistId,
            avatarUrl,
            albumId,
            albumTitle,
            durationInMs: duration * 1000,
          },
        ],
      });
    }

    if (type === "album") {
      return goToAlbumPage(id, name);
    }

    if (type === "artist") {
      return goToArtistPage(id, name);
    }
  };
  const hasRightChevron = type === "artist" || type === "album";
  const screenWidth = Dimensions.get("window").width;

  return (
    <TouchableOpacity onPress={handleRowPress}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: screenWidth,
          marginBottom: 8,
        }}
      >
        <SquareArtwork size={60} url={artworkUrl || avatarUrl} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text numberOfLines={1} bold>
            {name}
          </Text>
          <Text>{type}</Text>
        </View>
        {hasRightChevron && (
          <Icon name="chevron-right" size={24} color={colors.text} />
        )}
      </View>
    </TouchableOpacity>
  );
};

interface SearchResultsProps {
  query: string;
}

export const SearchResults = ({ query }: SearchResultsProps) => {
  const debouncedSearchQuery = useDebounce(query, 300);
  const { data = [] } = useQuery({
    queryKey: ["search", debouncedSearchQuery],
    queryFn: () => search(debouncedSearchQuery),
    enabled: query.length > 0,
  });

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1, alignItems: "center" }}>
        <FlatList
          data={data}
          renderItem={({ item }) => <SearchResultRow {...item} />}
          keyExtractor={(item) => item.id}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};
