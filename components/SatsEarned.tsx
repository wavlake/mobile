import { Text } from "./shared/Text";
import { LightningIcon } from "./icons/";
import { View } from "react-native";
import { brandColors } from "@/constants";
import { useTheme } from "@react-navigation/native";

interface SatsEarnedProps {
  msats?: number;
  extraText?: string;
  defaultTextColor?: boolean;
}

export const SatsEarned = ({
  msats,
  extraText,
  defaultTextColor = false,
}: SatsEarnedProps) => {
  const { colors } = useTheme();
  const sats = msats ? parseInt((msats / 1000).toFixed(0)) : 0;

  return (
    <View
      style={{
        flexDirection: "row",
        transform: [{ translateX: -4 }],
      }}
    >
      <View>
        <LightningIcon
          width={20}
          height={20}
          fill={defaultTextColor ? colors.text : brandColors.orange.DEFAULT}
        />
      </View>
      <Text
        style={{
          color: defaultTextColor ? colors.text : brandColors.black.light,
        }}
      >
        {sats.toLocaleString()} sats{extraText}
      </Text>
    </View>
  );
};
