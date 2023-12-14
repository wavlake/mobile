import { Pressable, View } from "react-native";
import { SquareArtwork } from "./SquareArtwork";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MarqueeText } from "@/components/MarqueeText";
import { useGetArtistOrAlbumBasePathname } from "@/hooks/useGetArtistOrAlbumBasePathname";
import {
  State,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
import { togglePlayPause } from "@/utils";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";

interface PlayerButtonProps {
  onPress: () => void;
  iconName: "ios-play-sharp" | "ios-pause-sharp" | "ios-close-sharp";
}

const PlayerButton = ({ onPress, iconName }: PlayerButtonProps) => {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          width: 50,
          height: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={iconName} size={36} color={colors.text} />
      </View>
    </Pressable>
  );
};

export const MiniMusicPlayer = () => {
  const artistOrAlbumBasePathname = useGetArtistOrAlbumBasePathname();
  const router = useRouter();
  const { colors } = useTheme();
  const { position, duration } = useProgress();
  const { state: playbackState } = usePlaybackState();
  const { currentTrack, reset, isSwitchingTrackList } = useMusicPlayer();
  const willShowPlayer = currentTrack !== null;
  const willDisplayPauseButton =
    playbackState !== State.Paused || isSwitchingTrackList;
  const willDisplayPlayButton =
    playbackState === State.Paused && !isSwitchingTrackList;
  const { artworkUrl, title, artist } = currentTrack || {};
  const progressBarWidth = duration ? (position / duration) * 100 : 0;

  return willShowPlayer ? (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/player",
          params: { artistOrAlbumBasePathname },
        })
      }
    >
      <View style={{ backgroundColor: colors.background }}>
        <View
          style={{
            flexDirection: "row",
            padding: 10,
          }}
        >
          {artworkUrl && <SquareArtwork size={50} url={artworkUrl} />}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              flex: 1,
            }}
          >
            <View
              style={{ alignSelf: "flex-start", marginLeft: 10, maxWidth: 200 }}
            >
              <MarqueeText bold>{title}</MarqueeText>
              <MarqueeText>{artist}</MarqueeText>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              {willDisplayPauseButton && (
                <PlayerButton
                  onPress={togglePlayPause}
                  iconName="ios-pause-sharp"
                />
              )}
              {willDisplayPlayButton && (
                <PlayerButton
                  onPress={togglePlayPause}
                  iconName="ios-play-sharp"
                />
              )}
              <PlayerButton onPress={reset} iconName="ios-close-sharp" />
            </View>
          </View>
        </View>
        <View
          style={{
            height: 1,
            backgroundColor: "gray",
            width: `${progressBarWidth}%`,
          }}
        />
      </View>
    </Pressable>
  ) : null;
};
