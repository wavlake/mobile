import { FlatList, FlatListProps, TouchableOpacity, View } from "react-native";
import { Text, SquareArtwork } from "@/components";
import { useGetColorPalette } from "@/hooks";
import { brandColors } from "@/constants";
import { Track } from "@/utils";

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
      windowSize={4}
      removeClippedSubviews={true}
      maxToRenderPerBatch={3}
    />
  );
};

const RowItem: React.FC<{
  item: HorizontalArtworkRowItem & Pick<Track, "genre">;
  isLast: boolean;
}> = ({ item, isLast }) => {
  const {
    background,
    foreground: textColor,
    backgroundIsBlack,
    lightenedBackgroundColor,
    isLoading,
  } = useGetColorPalette(item.artworkUrl);

  // default to light black if these colors are not available
  const backgroundColor = isLoading
    ? brandColors.black.DEFAULT
    : backgroundIsBlack
    ? lightenedBackgroundColor || brandColors.black.light
    : background ?? brandColors.black.light;

  return (
    <View
      style={{
        marginRight: isLast ? 0 : 16,
        backgroundColor,
        borderRadius: 20,
        width: 232,
        padding: 16,
      }}
    >
      <SquareArtwork size={200} url={item.artworkUrl} />
      <Text
        style={{
          textAlign: "center",
          paddingTop: 8,
          color: isLoading ? brandColors.black.DEFAULT : textColor ?? "white",
        }}
        ellipsizeMode="tail"
        numberOfLines={1}
      >
        {item.title}
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: isLoading ? brandColors.black.DEFAULT : textColor ?? "white",
        }}
        ellipsizeMode="tail"
        numberOfLines={1}
      >
        {item.genre?.name}
      </Text>
    </View>
  );
};
