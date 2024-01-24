import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getArtist } from "@/utils";
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
import { SatsEarned } from "@/components/SatsEarned";
import { WebsiteIcon } from "@/components/WebsiteIcon";
import * as Linking from "expo-linking";
import { useTheme } from "@react-navigation/native";
import { ElementType, useEffect } from "react";
import { TwitterIcon } from "@/components/TwitterIcon";
import { NostrIcon } from "@/components/NostrIcon";
import { InstagramIcon } from "@/components/InstagramIcon";
import { useGoToAlbumPage } from "@/hooks";
import { useGetArtistOrAlbumBasePathname } from "@/hooks/useGetArtistOrAlbumBasePathname";
import { BasicAvatar } from "@/components/BasicAvatar";
import { ArtistBanner } from "@/components/ArtistBanner";

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
  const topAlbums = artist?.topAlbums ?? [];
  const topTracks = artist?.topTracks?.slice(0, 4) ?? [];
  const topMessages = artist?.topMessages ?? [];
  const basePathname = useGetArtistOrAlbumBasePathname();
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
  const hanldlePlayAllPress = async (index: number, playerTitle: string) => {
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
        onPlay={hanldlePlayAllPress}
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
              onPress={() => hanldlePlayAllPress(index, artist.name)}
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
            includeBackButton: true,
          },
        }}
      />
      <HorizontalArtworkRow items={topAlbums} onPress={handleTopAlbumPress} />
      {topMessages.length > 0 && (
        <>
          <SectionHeader title="Latest Messages" />
          {topMessages.map(
            ({
              id,
              commenterArtworkUrl,
              content,
              msatAmount,
              name,
              title,
              userId,
              isNostr,
            }) => {
              const generateExtraText = () => {
                if (isNostr) {
                  // use the provided name, else use the npub (set as the userId for nostr comments)
                  return `from @${name ?? userId.slice(10)} for "${title}"`;
                }

                // keysend names may start with @
                return `from @${name.replace("@", "")} for "${title}"`;
              };

              const extraText = generateExtraText();

              return (
                <View
                  key={id}
                  style={{
                    marginBottom: 16,
                    flexDirection: "row",
                    paddingHorizontal: 16,
                  }}
                >
                  <BasicAvatar uri={commenterArtworkUrl} />
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
        </>
      )}
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
