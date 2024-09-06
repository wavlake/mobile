import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getArtist, getArtistTracks } from "@/utils";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { AlbumOrArtistPageButtons } from "@/components/AlbumOrArtistPageButtons";
import { Center } from "@/components/Center";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { FireIcon } from "@/components/FireIcon";
import { brandColors } from "@/constants";
import { SectionHeader } from "@/components/SectionHeader";
import { TrackRow } from "@/components/TrackRow";
import { HorizontalArtworkRow } from "@/components/HorizontalArtworkRow";
import { Text } from "@/components/Text";
import { WebsiteIcon } from "@/components/WebsiteIcon";
import * as Linking from "expo-linking";
import { useTheme } from "@react-navigation/native";
import { ElementType, useEffect } from "react";
import { TwitterIcon } from "@/components/TwitterIcon";
import { NostrIcon } from "@/components/NostrIcon";
import { InstagramIcon } from "@/components/InstagramIcon";
import { useGoToAlbumPage } from "@/hooks";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { ArtistBanner } from "@/components/ArtistBanner";
import { CommentList } from "./Comments/CommentList";

interface SocialIconLinkProps {
  url: string;
  Icon: ElementType;
}

const SocialIconLink = ({ url, Icon }: SocialIconLinkProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={() => Linking.openURL(url)}>
      <Icon fill={colors.text} width={24} height={24} />
    </TouchableOpacity>
  );
};

export const ArtistPage = () => {
  const { loadTrackList } = useMusicPlayer();
  const { artistId } = useLocalSearchParams();
  const { data: artist } = useQuery({
    queryKey: [artistId],
    queryFn: () => getArtist(artistId as string),
  });
  const { data: tracks = [] } = useQuery({
    queryKey: [artistId, "tracks"],
    queryFn: () => getArtistTracks(artistId as string),
  });
  const topAlbums = artist?.topAlbums ?? [];
  const topTracks = artist?.topTracks?.slice(0, 4) ?? [];
  const basePathname = useGetBasePathname();
  const goToAlbumPage = useGoToAlbumPage();
  const router = useRouter();
  const isVerified = artist?.verified ?? false;

  useEffect(() => {
    if (isVerified) {
      router.setParams({ includeHeaderTitleVerifiedBadge: "1" });
    }
  }, [isVerified]);

  const handleTopAlbumPress = (index: number) => {
    const album = topAlbums[index];

    if (!album) {
      return;
    }

    goToAlbumPage(album.id, album.title);
  };
  const handlePlayAllPress = async (index: number, playerTitle: string) => {
    const topTracks = artist?.topTracks ?? [];

    if (topTracks.length === 0) {
      return;
    }

    await loadTrackList({
      trackList: topTracks,
      trackListId: artistId as string,
      startIndex: index,
      playerTitle,
    });
  };

  return artist ? (
    <ScrollView>
      <ArtistBanner uri={artist.artworkUrl} />
      <AlbumOrArtistPageButtons
        type="artist"
        shareUrl={`https://wavlake.com/${artist.artistUrl}`}
        content={artist}
        trackListId={artist.id}
        trackListTitle={artist.name}
        onPlay={handlePlayAllPress}
      />
      <SectionHeader
        title="Top Tracks"
        icon={
          <FireIcon fill={brandColors.orange.DEFAULT} width={30} height={30} />
        }
      />
      <View style={{ gap: 16 }}>
        {topTracks.map((track, index) => {
          const { id, albumTitle } = track;
          return (
            <TrackRow
              key={id}
              track={track}
              descriptor={albumTitle}
              onPress={() => handlePlayAllPress(index, artist.name)}
            />
          );
        })}
      </View>
      <SectionHeader
        title="Releases"
        rightNavText="View All"
        rightNavHref={{
          pathname: `${basePathname}/artist/[artistId]/albums`,
          params: {
            artistId,
            headerTitle: artist.name,
            includeBackButton: "true",
          },
        }}
      />
      <HorizontalArtworkRow items={topAlbums} onPress={handleTopAlbumPress} />
      <CommentList
        contentIds={tracks.map((track) => track.id)}
        parentContentId={artistId as string}
        parentContentTitle={artist.name}
        parentContentType="artist"
      />
      {artist.bio && (
        <>
          <SectionHeader title="About" />
          <Text style={{ fontSize: 18 }}>{artist.bio}</Text>
        </>
      )}
      <View
        style={{
          flexDirection: "row",
          gap: 36,
          marginTop: 36,
          paddingBottom: 120,
        }}
      >
        {artist.website && (
          <SocialIconLink url={artist.website as string} Icon={WebsiteIcon} />
        )}
        {artist.twitter && (
          <SocialIconLink url={artist.twitter as string} Icon={TwitterIcon} />
        )}
        {artist.npub && (
          <SocialIconLink
            url={`https://njump.me/${artist.npub}`}
            Icon={NostrIcon}
          />
        )}
        {artist.instagram && (
          <SocialIconLink
            url={artist.instagram as string}
            Icon={InstagramIcon}
          />
        )}
      </View>
    </ScrollView>
  ) : (
    <Center>
      <ActivityIndicator />
    </Center>
  );
};
