import {
  View,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useProgress } from "react-native-track-player";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { Center, PlaylistButton, MarqueeText } from "@/components";
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
  useGetColorPalette,
} from "@/hooks";
import { ShareButton } from "@/components/ShareButton";
import { LikeButton } from "@/components/LikeButton";
import { OverflowMenu } from "@/components/FullSizeMusicPlayer/OverflowMenu";
import { useState } from "react";
import { WalletChooserModal } from "../WalletChooserModal";
import { useSettings } from "@/hooks/useSettings";
import { ArrowTopRightOnSquareIcon } from "react-native-heroicons/solid";
import { ShuffleButton } from "./ShuffleButton";
import { NowPlayingCommentSection } from "./NowPlayingCommentSection";

export const FullSizeMusicPlayer = () => {
  const [isWalletChooserModalVisible, setIsWalletChooserModalVisible] =
    useState(false);
  const { basePathname = "" } = useLocalSearchParams<{
    basePathname: string;
  }>();
  const router = useRouter();
  const { position } = useProgress();
  const { activeTrack, isEarning } = useMusicPlayer();
  const { data: settings, refetch: refetchSettings } = useSettings();
  const { oneTapZap = false } = settings || {};

  const {
    id: trackId,
    artistId,
    albumId,
    albumTitle,
    artist,
    title,
    artworkUrl,
  } = activeTrack || {
    id: "",
    artistId: "",
    albumId: "",
    albumTitle: "",
    artist: "",
    title: "",
    artworkUrl: "",
  };

  // const { background, foreground, backgroundIsBlack } =
  //   useGetColorPalette(artworkUrl);

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
        ? `${basePathname}/podcast/[albumId]`
        : `${basePathname}/album/[albumId]`,
      params: {
        albumId,
        headerTitle: isPodcast ? artist : albumTitle,
        includeBackButton: "true",
      },
    });
  };
  const handleArtistPress = () => {
    router.push({
      pathname: isPodcast
        ? `${basePathname}/podcast/[albumId]`
        : `${basePathname}/artist/[artistId]`,
      params: {
        albumId,
        artistId,
        headerTitle: artist,
        includeBackButton: "true",
      },
    });
  };
  const handleLikePress = async () => {
    if (!activeTrack) {
      return;
    }

    if (isTrackInLibrary) {
      deleteTrackFromLibraryMutation.mutate(trackId);
    } else {
      addTrackToLibraryMutation.mutate(activeTrack);
    }
  };

  const { sendZap, isLoading } = useZap({
    isPodcast,
    trackId,
    title,
    artist,
    artworkUrl,
    // TODO - move useProgress() to the zap hook
    timestamp: position,
    parentContentId: albumId,
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
        defaultZapAmount,
        title,
        artist,
        artworkUrl,
        trackId,
        timestamp: position,
        isPodcast: isPodcast ? "true" : "false",
        parentContentId: albumId,
      },
    });
  };

  if (!activeTrack) {
    return (
      <Center>
        <ActivityIndicator />
      </Center>
    );
  }

  const isMusic = albumTitle != "podcast";
  // const backgroundColor = backgroundIsBlack
  //   ? brandColors.black.light
  //   : background ?? brandColors.black.light;

  return (
    <>
      <View
        style={{
          paddingTop: 8,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          // backgroundColor,
        }}
      >
        <ArtworkCarousel />
        <View
          style={{
            paddingHorizontal,
            paddingVertical: isSmallScreen ? 16 : 24,
            flexGrow: 1,
          }}
        >
          <View
            style={{
              display: "flex",
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginRight: 18,
                  }}
                >
                  <MarqueeText style={{ fontSize: 18 }}>{artist}</MarqueeText>
                  <ArrowTopRightOnSquareIcon
                    color={brandColors.beige.dark}
                    height={20}
                    width={20}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              disabled={isLoading}
              onPress={oneTapZap ? handleOneTapZap : goToZapPage}
              onLongPress={oneTapZap ? goToZapPage : undefined}
              style={{
                alignItems: "flex-end",
                justifyContent: "flex-start",
                width: 50,
              }}
            >
              <View
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
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
              </View>
            </TouchableOpacity>
          </View>
          <PlayerControls isSmallScreen={isSmallScreen} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingBottom: 20,
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
                isMusic={isMusic}
              />
              <PlaylistButton
                size={30}
                contentId={activeTrack.id}
                contentTitle={title}
                isMusic={isMusic}
              />
              <ShuffleButton />
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <ShareButton url={shareUrl} />
              {isMusic && (
                <OverflowMenu
                  artist={artist}
                  artistId={artistId}
                  albumTitle={albumTitle}
                  albumId={albumId}
                />
              )}
            </View>
          </View>
          <NowPlayingCommentSection contentId={activeTrack.id} />
        </View>
      </View>
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
  );
};
