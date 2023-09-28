import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/Text";
import { SatsEarned } from "@/components/SatsEarned";
import { TrackArtwork } from "@/components/TrackArtwork";

interface TrackRowProps {
  title: string;
  descriptor: string;
  msats?: number;
  onPress: () => void;
  artworkUrl?: string;
}

export const TrackRow = ({
  title,
  descriptor,
  msats,
  onPress,
  artworkUrl,
}: TrackRowProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        height: 60,
        paddingRight: 16,
        flexDirection: "row",
      }}
    >
      {artworkUrl && <TrackArtwork size={60} url={artworkUrl} />}
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={{ fontSize: 18 }} numberOfLines={1} bold>
          {title}
        </Text>
        <Text numberOfLines={1}>{descriptor}</Text>
        <SatsEarned msats={msats} />
      </View>
    </TouchableOpacity>
  );
};
