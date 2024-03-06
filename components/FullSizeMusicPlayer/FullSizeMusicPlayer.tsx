import {
  View,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useProgress } from "react-native-track-player";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { Center } from "@/components/Center";
import { MarqueeText } from "@/components/MarqueeText";
import { PlayerControls } from "./PlayerControls";
import { ArtworkCarousel } from "./ArtworkCarousel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ZapIcon } from "@/components/ZapIcon";
import { brandColors } from "@/constants";
import { cacheSettings, validateWalletKey } from "@/utils";
import {
  useAuth,
  useAddTrackToLibrary,
  useDeleteTrackFromLibrary,
  useIsTrackInLibrary,
  useZap,
} from "@/hooks";
import { ShareButton } from "@/components/ShareButton";
import { LikeButton } from "@/components/LikeButton";
import { PlaylistButton } from "../Playlist/PlaylistButton";
import { MoreOptions } from "@/components/FullSizeMusicPlayer/MoreOptions";
import { useState } from "react";
import { WalletChooserModal } from "../WalletChooserModal";
import { useSettings } from "@/hooks/useSettings";

export const FullSizeMusicPlayer = () => {
  const [isWalletChooserModalVisible, setIsWalletChooserModalVisible] =
    useState(false);
  const { artistOrAlbumBasePathname = "" } = useLocalSearchParams<{
    artistOrAlbumBasePathname: string;
  }>();
  const router = useRouter();
  const { position } = useProgress();
  const { currentTrack } = useMusicPlayer();
  const { data: settings, refetch: refetchSettings } = useSettings();
  const { oneTapZap = false } = settings || {};
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
  const isSmallScreen = Dimensions.get("window").height < 700;
  const paddingHorizontal = 24;
  const { pubkey } = useAuth();
  const isPodcast = albumTitle === "podcast";
  const shareUrl = isPodcast
    ? `https://wavlake.com/episode/${trackId}`
    : `https://wavlake.com/track/${trackId}`;
  const handleTitlePress = () => {
    router.push({
      pathname: isPodcast
        ? `${artistOrAlbumBasePathname}/podcast/[albumId]`
        : `${artistOrAlbumBasePathname}/album/[albumId]`,
      params: {
        albumId,
        headerTitle: isPodcast ? artist : albumTitle,
        includeBackButton: true,
      },
    });
  };
  const handleArtistPress = () => {
    router.push({
      pathname: isPodcast
        ? `${artistOrAlbumBasePathname}/podcast/[albumId]`
        : `${artistOrAlbumBasePathname}/artist/[artistId]`,
      params: {
        albumId,
        artistId,
        headerTitle: isPodcast ? artist : albumTitle,
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
      addTrackToLibraryMutation.mutate(currentTrack);
    }
  };

  const { sendZap, isLoading } = useZap({
    trackId,
    title,
    artist,
    artworkUrl,
    timestamp: position,
  });

  const handleOneTapZap = async () => {
    const { defaultZapWallet, enableNWC, defaultZapAmount } = settings || {};
    const defaultsAreSet =
      defaultZapAmount && (enableNWC || validateWalletKey(defaultZapWallet));
    if (!defaultsAreSet) {
      setIsWalletChooserModalVisible(true);
      return;
    }
    sendZap();
  };

  const goToZapPage = () => {
    const { defaultZapWallet, enableNWC, defaultZapAmount } = settings || {};
    const defaultsAreSet =
      defaultZapAmount && (enableNWC || validateWalletKey(defaultZapWallet));
    if (!defaultsAreSet) {
      setIsWalletChooserModalVisible(true);
      return;
    }
    router.push({
      pathname: "/zap",
      params: {
        defaultZapAmount: settings?.defaultZapAmount,
        title,
        artist,
        artworkUrl,
        trackId,
        timestamp: position,
      },
    });
  };

  return currentTrack ? (
    <>
      <ScrollView style={{ paddingTop: 8 }}>
        <ArtworkCarousel />
        <View
          style={{
            paddingHorizontal,
            paddingVertical: isSmallScreen ? 16 : 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              maxWidth: screenWidth - paddingHorizontal * 2,
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
              disabled={isLoading}
              onPress={oneTapZap ? handleOneTapZap : goToZapPage}
              onLongPress={oneTapZap ? goToZapPage : undefined}
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: 8,
              }}
            >
              {isLoading ? (
                <ActivityIndicator
                  animating={true}
                  size="small"
                  style={{ paddingRight: 8 }}
                />
              ) : (
                <ZapIcon
                  fill={brandColors.pink.DEFAULT}
                  width={40}
                  height={40}
                />
              )}
            </TouchableOpacity>
          </View>
          <PlayerControls isSmallScreen={isSmallScreen} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 24 }}
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
              <PlaylistButton
                size={30}
                contentId={currentTrack.id}
                isMusic={currentTrack.albumTitle != "podcast"}
              />
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <ShareButton url={shareUrl} />
              <MoreOptions
                artist={artist}
                artistId={artistId}
                albumTitle={albumTitle}
                albumId={albumId}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <WalletChooserModal
        onContinue={async () => {
          await refetchSettings();
          setIsWalletChooserModalVisible(false);
        }}
        onCancel={async () => {
          await cacheSettings({ defaultZapWallet: "default" }, pubkey);
          await refetchSettings();
          setIsWalletChooserModalVisible(false);
        }}
        visible={isWalletChooserModalVisible}
      />
    </>
  ) : (
    <Center>
      <ActivityIndicator />
    </Center>
  );
};
