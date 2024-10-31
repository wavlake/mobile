import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { SquareArtwork } from "./SquareArtwork";
import { Text } from "./shared/Text";

interface HorizontalArtworkRowItem {
  artworkUrl: string;
  title: string;
}

interface HorizontalArtworkRowProps {
  items: HorizontalArtworkRowItem[];
  onPress: (index: number) => void;
  willShowTitle?: boolean;
}

export const HorizontalArtworkRow = ({
  items,
  onPress,
  willShowTitle = false,
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
                width: 124,
              }}
            >
              <SquareArtwork size={124} url={item.artworkUrl} />
              {willShowTitle && <Text numberOfLines={1}>{item.title}</Text>}
            </View>
          </TouchableOpacity>
        );
      }}
      scrollEnabled
      showsHorizontalScrollIndicator={false}
      windowSize={5}
      removeClippedSubviews={true}
      maxToRenderPerBatch={3}
    />
  );
};
