import { SectionHeader } from "./SectionHeader";
import { View } from "react-native";
import { useNewMusic } from "@/hooks";
import { HorizontalArtworkRow } from "@/components/HorizontalArtworkRow";
import { TouchableOpacity } from "react-native-gesture-handler";

export const ListenToEarnSection = () => {
  const { data = [] } = useNewMusic();
  const onPress = () => console.log("Listen to earn pressed");

  return (
    <View>
      <TouchableOpacity onPress={onPress}>
        <SectionHeader title="Listen to Earn" />
        <HorizontalArtworkRow items={data} onPress={onPress} />
      </TouchableOpacity>
    </View>
  );
};
