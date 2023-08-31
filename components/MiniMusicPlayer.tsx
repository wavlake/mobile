import { View, Pressable } from "react-native";
import { SongArtwork } from "./SongArtwork";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MarqueeText } from "@/components/MarqueeText";

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
  const router = useRouter();
  const { colors } = useTheme();
  const {
    songQueue,
    currentSongIndex,
    isPlaying,
    positionInMs,
    togglePlayPause,
    clear,
  } = useMusicPlayer();
  const currentSong = songQueue[currentSongIndex];
  const { artworkUrl, title, artist, durationInMs } = currentSong || {};
  const progressBarWidth = durationInMs
    ? (positionInMs / durationInMs) * 100 || 0
    : 0;

  return currentSong ? (
    <Pressable onPress={() => router.push("/player")}>
      <View style={{ backgroundColor: colors.background }}>
        <View
          style={{
            flexDirection: "row",
            padding: 10,
          }}
        >
          {artworkUrl && <SongArtwork size={50} url={artworkUrl} />}
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
              {isPlaying ? (
                <PlayerButton
                  onPress={togglePlayPause}
                  iconName="ios-pause-sharp"
                />
              ) : (
                <PlayerButton
                  onPress={togglePlayPause}
                  iconName="ios-play-sharp"
                />
              )}
              <PlayerButton onPress={clear} iconName="ios-close-sharp" />
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
