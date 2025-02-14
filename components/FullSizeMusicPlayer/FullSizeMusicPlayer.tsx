import {
  View,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useProgress } from "react-native-track-player";
import { useMusicPlayer } from "../MusicPlayerProvider";
import { Center } from "../shared/Center";
import { MarqueeText } from "../shared/MarqueeText";
import { PlayerControls } from "./PlayerControls";
import { ArtworkCarousel } from "./ArtworkCarousel";
import { useRouter } from "expo-router";
import { ZapIcon } from "../icons";
import { brandColors } from "@/constants";
import { validateWalletKey } from "@/utils";
import { useAuth, useSettingsManager, useUser, useZapContent } from "@/hooks";
import { useState } from "react";
import { WalletChooserModal } from "../WalletChooserModal";
import { ArrowTopRightOnSquareIcon } from "react-native-heroicons/solid";
import { NowPlayingCommentSection } from "./NowPlayingCommentSection";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";

export const FullSizeMusicPlayer = () => {
  const [isWalletChooserModalVisible, setIsWalletChooserModalVisible] =
    useState(false);
  const basePathname = useGetBasePathname();
  const router = useRouter();
  const { position } = useProgress();
  const { activeTrack } = useMusicPlayer();
  const { catalogUser } = useUser();

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
  const {
    updateSettings,
    settings,
    refetch: refetchSettings,
  } = useSettingsManager();
  const { oneTapZap = false } = settings || {};

  const { sendZap, isLoading } = useZapContent({
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
  const userIdOrPubkey = catalogUser?.id ?? pubkey;
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
            paddingVertical: 6,
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
          await updateSettings({ defaultZapWallet: "default" });
          await refetchSettings();
          setIsWalletChooserModalVisible(false);
        }}
        visible={isWalletChooserModalVisible}
      />
    </>
  );
};
