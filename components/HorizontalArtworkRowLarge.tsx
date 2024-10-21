import { FlatList, TouchableOpacity, View } from "react-native";
import { Text, SquareArtwork } from "@/components";
import { brandColors } from "@/constants";

interface HorizontalArtworkRowItem {
  artworkUrl: string;
  title: string;
  // albumId: string;
  // albumTitle: string;
  artist: string;
  colorInfo?: {
    darkMuted: string;
    darkVibrant: string;
    lightMuted: string;
    lightVibrant: string;
    muted: string;
    vibrant: string;
  };
  // artistId: string;
  // artistUrl: string;
  // avatarUrl: undefined;
  // duration: number;
  // hasPromo: undefined;
  // id: string;
  // liveUrl: string;
  // msatTotal: undefined;
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
  item: HorizontalArtworkRowItem;
  isLast: boolean;
}> = ({ item, isLast }) => {
  const backgroundColor =
    item?.colorInfo?.darkVibrant ?? brandColors.black.DEFAULT;
  const textColor = item?.colorInfo?.lightVibrant ?? "white";

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
          color: textColor,
        }}
        ellipsizeMode="tail"
        numberOfLines={1}
      >
        {item.title}
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: textColor,
        }}
        ellipsizeMode="tail"
        numberOfLines={1}
      >
        {item.artist}
      </Text>
    </View>
  );
};
