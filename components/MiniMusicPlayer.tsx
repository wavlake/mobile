import { View, TouchableOpacity } from "react-native";
import { SongArtwork } from "./SongArtwork";
import { Text } from "./Text";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { useTheme } from "@react-navigation/native";
import { PlayIcon, PauseIcon, XMarkIcon } from "react-native-heroicons/solid";
import { ElementType } from "react";

interface PlayerButtonProps {
  onPress: () => void;
  Icon: ElementType;
}

const PlayerButton = ({ onPress, Icon }: PlayerButtonProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          width: 50,
          height: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon fill={colors.text} size={36} />
      </View>
    </TouchableOpacity>
  );
};

export const MiniMusicPlayer = () => {
  const { colors } = useTheme();
  const { currentSong, isPlaying, positionInMs, play, pause, clear } =
    useMusicPlayer();
  const { artworkUrl, title, artist, durationInMs } = currentSong || {};
  const progressBarWidth = durationInMs
    ? (positionInMs / durationInMs) * 100 || 0
    : 0;
  const togglePlayPause = async () => {
    if (!currentSong) {
      return;
    }

    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  return currentSong ? (
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
            <Text numberOfLines={1} bold>
              {title}
            </Text>
            <Text numberOfLines={1}>{artist}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            {isPlaying ? (
              <PlayerButton onPress={togglePlayPause} Icon={PauseIcon} />
            ) : (
              <PlayerButton onPress={togglePlayPause} Icon={PlayIcon} />
            )}
            <PlayerButton onPress={clear} Icon={XMarkIcon} />
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
  ) : null;
};
