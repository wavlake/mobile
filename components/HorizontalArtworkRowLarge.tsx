import { FlatList, TouchableOpacity, View } from "react-native";
import { Text, SquareArtwork } from "@/components";
import { useGetColorPalette } from "@/hooks";

interface HorizontalArtworkRowItem {
  artworkUrl: string;
  title: string;
}

interface HorizontalArtworkRowProps {
  items: HorizontalArtworkRowItem[];
  onPress: (index: number) => void;
}

export const HorizontalArtworkRowLarge = ({
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
            <RowItem item={item} isLast={index === items.length - 1} />
          </TouchableOpacity>
        );
      }}
      scrollEnabled
      showsHorizontalScrollIndicator={false}
    />
  );
};

const RowItem: React.FC<{
  item: HorizontalArtworkRowItem;
  isLast: boolean;
}> = ({ item, isLast }) => {
  const { background, foreground, dominant } = useGetColorPalette(
    item.artworkUrl,
  );

  return (
    <View
      style={{
        marginRight: isLast ? 0 : 16,
        backgroundColor: background ?? "#000",
        borderRadius: 40,
        width: 232,
        padding: 16,
      }}
    >
      <SquareArtwork size={200} url={item.artworkUrl} />
      <Text
        style={{
          textAlign: "center",
          paddingTop: 8,
          color: foreground ?? "#fff",
        }}
        ellipsizeMode="tail"
        numberOfLines={1}
      >
        {item.title}
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: foreground ?? "#fff",
        }}
        ellipsizeMode="tail"
        numberOfLines={1}
      >
        Singer/Songwriter
      </Text>
    </View>
  );
};
