import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getArtist, formatTrackListForMusicPlayer } from "@/utils";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { AlbumOrArtistPageHeader } from "@/components/AlbumOrArtistPageHeader";
import { Center } from "@/components/Center";
import {
  LoadTrackList,
  useMusicPlayer,
} from "@/components/MusicPlayerProvider";
import { FireIcon } from "@/components/FireIcon";
import { brandColors } from "@/constants";
import { SectionHeader } from "@/components/SectionHeader";
import { TrackRow } from "@/components/TrackRow";
import { HorizontalArtworkRow } from "@/components/HorizontalArtworkRow";
import { Text } from "@/components/Text";
import { SatsEarned } from "@/components/SatsEarned";
import { Avatar } from "@rneui/themed";
import { WebsiteIcon } from "@/components/WebsiteIcon";
import * as Linking from "expo-linking";
import { useTheme } from "@react-navigation/native";
import { ElementType } from "react";
import { TwitterIcon } from "@/components/TwitterIcon";
import { NostrIcon } from "@/components/NostrIcon";
import { InstagramIcon } from "@/components/InstagramIcon";

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

interface ArtistPageContentProps {
  loadTrackList: LoadTrackList;
}

const ArtistPageContent = ({ loadTrackList }: ArtistPageContentProps) => {
  const { artistId } = useLocalSearchParams();
  const { data: artist } = useQuery({
    queryKey: [artistId],
    queryFn: () => getArtist(artistId as string),
  });
  const router = useRouter();
  const pathname = usePathname();
  const basePathname = pathname.startsWith("/search") ? "/search" : "";

  const handleTopAlbumPress = async (index: number) => {
    const album = artist?.topAlbums[index];

    if (!album) {
      return;
    }

    return router.push({
      pathname: `${basePathname}/album/[albumId]`,
      params: {
        albumId: album.id,
        headerTitle: album.title,
        includeBackButton: true,
      },
    });
  };
  const hanldlePlayAllPress = async (index: number, playerTitle: string) => {
    const topTracks = artist?.topTracks ?? [];

    if (topTracks.length === 0) {
      return;
    }

    await loadTrackList({
      trackList: formatTrackListForMusicPlayer(topTracks),
      trackListId: artistId as string,
      startIndex: index,
      playerTitle,
    });
  };

  return artist ? (
    <ScrollView>
      <AlbumOrArtistPageHeader
        type="artist"
        shareUrl={`https://wavlake.com/${artist.artistUrl}`}
        artworkUrl={artist.artworkUrl}
        trackListId={artist.id}
        trackListTitle={artist.name}
        onPlay={hanldlePlayAllPress}
      />
      <SectionHeader
        title="Top Tracks"
        icon={
          <FireIcon fill={brandColors.orange.DEFAULT} width={30} height={30} />
        }
      />
      <View style={{ gap: 16 }}>
        {artist.topTracks.map(
          ({ id, title, artworkUrl, albumTitle, msatTotal }, index) => {
            return (
              <TrackRow
                key={id}
                title={title}
                descriptor={albumTitle}
                msats={msatTotal}
                onPress={() => hanldlePlayAllPress(index, artist.name)}
                artworkUrl={artworkUrl}
              />
            );
          },
        )}
      </View>
      <SectionHeader
        title="Releases"
        rightNavText="View All"
        rightNavHref={{
          pathname: `${basePathname}/artist/[artistId]/albums`,
          params: {
            artistId,
            headerTitle: artist.name,
            includeBackButton: true,
          },
        }}
      />
      <HorizontalArtworkRow
        items={artist.topAlbums}
        onPress={handleTopAlbumPress}
      />
      <SectionHeader title="Latest Messages" />
      {artist.topMessages.map(
        ({ id, commenterArtworkUrl, content, msatAmount, name, title }) => {
          const extraText = `from @${name} for "${title}"`;

          return (
            <View
              key={id}
              style={{
                marginBottom: 16,
                flexDirection: "row",
                paddingHorizontal: 16,
              }}
            >
              <Avatar size={32} rounded source={{ uri: commenterArtworkUrl }} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text bold>{content}</Text>
                <SatsEarned
                  msats={msatAmount}
                  extraText={extraText}
                  defaultTextColor
                />
              </View>
            </View>
          );
        },
      )}
      <SectionHeader title="About" />
      <Text style={{ fontSize: 18 }}>{artist.bio}</Text>
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

export const ArtistPage = () => {
  const { loadTrackList } = useMusicPlayer();

  return <ArtistPageContent loadTrackList={loadTrackList} />;
};
