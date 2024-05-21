import { Text } from "@/components";
import MosaicImage from "@/components/Mosaic";
import { Playlist } from "@/utils";
import { TouchableOpacity, View } from "react-native";

export const PlaylistRow = ({
  playlist,
  onPress,
  isLastRow,
  height,
}: {
  playlist: Playlist;
  onPress: () => void;
  isLastRow: boolean;
  height: number;
}) => {
  const { tracks = [], title } = playlist;
  const marginBottom = isLastRow ? height + 16 : 16;
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          marginBottom,
          alignItems: "center",
          gap: 4,
        }}
      >
        <MosaicImage imageUrls={tracks.map((track) => track.artworkUrl)} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
            }}
            numberOfLines={3}
            bold
          >
            {title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
