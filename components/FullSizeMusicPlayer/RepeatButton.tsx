import { useTheme } from "@react-navigation/native";
import { PressableIcon } from "../PressableIcon";
import { Entypo } from "@expo/vector-icons";
import { brandColors } from "@/constants";
import { useMusicPlayer } from "../MusicPlayerProvider";

interface RepeatButtonProps {
  size?: number;
}

export const RepeatButton = ({ size = 24 }: RepeatButtonProps) => {
  const { colors } = useTheme();
  const { toggleRepeatTrack, repeatMode } = useMusicPlayer();
  const onPress = () => {
    toggleRepeatTrack();
  };

  return (
    <PressableIcon onPress={onPress}>
      <Entypo
        name="loop"
        size={size}
        color={repeatMode ? brandColors.pink.DEFAULT : colors.text}
      />
    </PressableIcon>
  );
};
