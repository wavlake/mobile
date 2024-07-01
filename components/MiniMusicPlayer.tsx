import { Pressable, View } from "react-native";
import { SquareArtwork } from "./SquareArtwork";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MarqueeText } from "@/components/MarqueeText";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import {
  State,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
import { togglePlayPause } from "@/utils";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";

interface PlayerButtonProps {
  onPress: () => void;
  iconName: "play-sharp" | "pause-sharp" | "close-sharp";
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
  const basePathname = useGetBasePathname();
  const router = useRouter();
  const { colors } = useTheme();
  const { position, duration } = useProgress();
  const { state: playbackState } = usePlaybackState();
  const { activeTrack, reset, isSwitchingTrackList } = useMusicPlayer();
  const willShowPlayer = !!activeTrack;
  const willDisplayPauseButton =
    playbackState !== State.Paused || isSwitchingTrackList;
  const willDisplayPlayButton =
    playbackState === State.Paused && !isSwitchingTrackList;
  const { title, artist, artworkUrl } = activeTrack || {};
  const progressBarWidth = duration ? (position / duration) * 100 : 0;

  return willShowPlayer ? (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/player",
          params: { basePathname },
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
                  iconName="pause-sharp"
                />
              )}
              {willDisplayPlayButton && (
                <PlayerButton onPress={togglePlayPause} iconName="play-sharp" />
              )}
              <PlayerButton onPress={reset} iconName="close-sharp" />
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
