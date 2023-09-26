import { Text } from "@/components/Text";
import { LightningIcon } from "@/components/LightningIcon";
import { View } from "react-native";
import { brandColors } from "@/constants";

interface SatsEarnedProps {
  msats?: number;
}

export const SatsEarned = ({ msats }: SatsEarnedProps) => {
  const sats = msats ? msats / 1000 : 0;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        transform: [{ translateX: -4 }],
      }}
    >
      <View>
        <LightningIcon
          width={20}
          height={20}
          fill={brandColors.orange.DEFAULT}
        />
      </View>
      <Text style={{ color: brandColors.black.light }}>
        {sats.toLocaleString()} sats
      </Text>
    </View>
  );
};
