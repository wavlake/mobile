import { FlatList, TouchableOpacity, View } from "react-native";
import { TrackArtwork } from "@/components/TrackArtwork";

interface HorizontalArtworkRowItem {
  artworkUrl: string;
  [key: string]: any;
}

interface HorizontalArtworkRowProps {
  items: HorizontalArtworkRowItem[];
  onPress: (index: number) => void;
}

export const HorizontalArtworkRow = ({
  items,
  onPress,
}: HorizontalArtworkRowProps) => {
  return (
    <FlatList
      horizontal
      data={items}
      renderItem={({ item, index }) => {
        return (
          <TouchableOpacity onPress={() => onPress(index)}>
            <View
              style={{
                marginRight: index === items.length - 1 ? 0 : 16,
              }}
            >
              <TrackArtwork size={124} url={item.artworkUrl} />
            </View>
          </TouchableOpacity>
        );
      }}
      scrollEnabled
      showsHorizontalScrollIndicator={false}
    />
  );
};
