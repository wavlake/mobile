import { Pressable } from "react-native";
import { useTheme } from "@react-navigation/native";
import { PlayRoundIcon } from "@/components/PlayRoundIcon";
import { PauseRoundIcon } from "@/components/PauseRoundIcon";

interface PlayPauseTrackButtonProps {
  size: number;
  type: "play" | "pause";

  onPress: () => void;
}

export const PlayPauseTrackButton = ({
  size,
  type,
  onPress,
}: PlayPauseTrackButtonProps) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.background,
        borderRadius: size / 2,
      }}
    >
      {type === "pause" && (
        <PauseRoundIcon width={size} height={size} fill={colors.text} />
      )}
      {type === "play" && (
        <PlayRoundIcon width={size} height={size} fill={colors.text} />
      )}
    </Pressable>
  );
};
