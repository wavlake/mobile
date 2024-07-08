import { useTheme } from "@react-navigation/native";
import { PressableIcon } from "../PressableIcon";
import { Entypo } from "@expo/vector-icons";
import { brandColors } from "@/constants";
import { useMusicPlayer } from "../MusicPlayerProvider";

interface ShuffleButtonProps {
  size?: number;
}

export const ShuffleButton = ({ size = 24 }: ShuffleButtonProps) => {
  const { colors } = useTheme();
  const { toggleShuffle, isShuffled } = useMusicPlayer();
  const onPress = () => {
    toggleShuffle();
  };

  return (
    <PressableIcon onPress={onPress}>
      <Entypo
        name="shuffle"
        size={size}
        color={isShuffled ? brandColors.pink.DEFAULT : colors.text}
      />
    </PressableIcon>
  );
};
