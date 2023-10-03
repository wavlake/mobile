import {
  View,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { Center } from "@/components/Center";
import { MarqueeText } from "@/components/MarqueeText";
import { PlayerControls } from "./PlayerControls";
import { ArtworkCarousel } from "./ArtworkCarousel";
import { useRouter } from "expo-router";
import { ZapIcon } from "@/components/ZapIcon";
import { brandColors } from "@/constants";
import { getSettings } from "@/utils";
import {
  useAuth,
  useAddTrackToLibrary,
  useDeleteTrackFromLibrary,
  useIsTrackInLibrary,
} from "@/hooks";
import { ShareButton } from "@/components/ShareButton";
import { LikeButton } from "@/components/LikeButton";

export const FullSizeMusicPlayer = () => {
  const router = useRouter();
  const { currentTrack } = useMusicPlayer();
  const {
    id: trackId,
    title,
    artist,
    artistId,
    albumId,
    albumTitle,
    artworkUrl,
  } = currentTrack ?? {
    id: "",
    title: "",
    artist: "",
    artistId: "",
    albumId: "",
    albumTitle: "",
    artworkUrl: "",
  };
  const isTrackInLibrary = useIsTrackInLibrary(trackId);
  const addTrackToLibraryMutation = useAddTrackToLibrary();
  const deleteTrackFromLibraryMutation = useDeleteTrackFromLibrary();
  const screenWidth = Dimensions.get("window").width;
  const padding = 24;
  const { pubkey } = useAuth();
  const handleTitlePress = () => {
    router.push({
      pathname: "/album/[albumId]",
      params: { albumId, headerTitle: albumTitle, includeBackButton: true },
    });
  };
  const handleArtistPress = () => {
    router.push({
      pathname: `/artist/[artistId]`,
      params: {
        artistId,
        headerTitle: artist,
        includeBackButton: true,
      },
    });
  };
  const handleLikePress = async () => {
    if (!currentTrack) {
      return;
    }

    if (isTrackInLibrary) {
      deleteTrackFromLibraryMutation.mutate(trackId);
    } else {
      // the duration, avatarUrl, and artistUrl are just needed to make TypeScript happy for the optimistic update
      addTrackToLibraryMutation.mutate({
        ...currentTrack,
        duration: currentTrack.durationInMs / 1000,
        avatarUrl: currentTrack.avatarUrl ?? "",
        artistUrl: "",
      });
    }
  };

  return currentTrack ? (
    <ScrollView style={{ paddingTop: 8 }}>
      <ArtworkCarousel />
      <View style={{ padding }}>
        <View
          style={{
            flexDirection: "row",
            maxWidth: screenWidth - padding * 2,
          }}
        >
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={handleTitlePress}>
              <MarqueeText style={{ fontSize: 20 }} bold>
                {title}
              </MarqueeText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleArtistPress}>
              <MarqueeText style={{ fontSize: 18 }}>{artist}</MarqueeText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={async () => {
              const { defaultZapAmount = "" } = await getSettings(pubkey);

              router.push({
                pathname: "/zap",
                params: {
                  defaultZapAmount,
                  title,
                  artist,
                  artworkUrl,
                  trackId,
                },
              });
            }}
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: 8,
            }}
          >
            <ZapIcon fill={brandColors.pink.DEFAULT} width={40} height={40} />
          </TouchableOpacity>
        </View>
        <PlayerControls />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <LikeButton
            onPress={handleLikePress}
            size={24}
            isLiked={isTrackInLibrary}
            isLoading={
              addTrackToLibraryMutation.isLoading ||
              deleteTrackFromLibraryMutation.isLoading
            }
          />
          <ShareButton url={`https://wavlake.com/track/${trackId}`} />
        </View>
      </View>
    </ScrollView>
  ) : (
    <Center>
      <ActivityIndicator />
    </Center>
  );
};
