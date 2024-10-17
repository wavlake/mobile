import {
  View,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useProgress } from "react-native-track-player";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { Center, MarqueeText } from "@/components";
import { PlayerControls } from "./PlayerControls";
import { ArtworkCarousel } from "./ArtworkCarousel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ZapIcon } from "@/components/ZapIcon";
import { brandColors } from "@/constants";
import { cacheSettings, validateWalletKey } from "@/utils";
import { useAuth, useZap } from "@/hooks";
import { useState } from "react";
import { WalletChooserModal } from "../WalletChooserModal";
import { useSettings } from "@/hooks/useSettings";
import { ArrowTopRightOnSquareIcon } from "react-native-heroicons/solid";
import { NowPlayingCommentSection } from "./NowPlayingCommentSection";

export const FullSizeMusicPlayer = () => {
  const [isWalletChooserModalVisible, setIsWalletChooserModalVisible] =
    useState(false);
  const { basePathname = "" } = useLocalSearchParams<{
    basePathname: string;
  }>();
  const router = useRouter();
  const { position } = useProgress();
  const { activeTrack } = useMusicPlayer();
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

  // const { background, foreground, backgroundIsNearBlack } =
  //   useGetColorPalette(artworkUrl);

  const screenWidth = Dimensions.get("window").width;
  const isSmallScreen = Dimensions.get("window").height < 700;
  const paddingHorizontal = 24;
  const { pubkey } = useAuth();
  const isPodcast = albumTitle === "podcast";
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

  // const backgroundColor = backgroundIsNearBlack
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
            paddingVertical: isSmallScreen ? 6 : 24,
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
