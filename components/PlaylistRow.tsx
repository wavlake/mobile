import { Text } from "./shared/Text";
import MosaicImage from "./Mosaic";
import { Playlist } from "@/utils";
import { TouchableOpacity, View } from "react-native";
import { OverflowMenuDialog } from "./FullSizeMusicPlayer/OverflowMenuDialog";
import { useState } from "react";

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
  const [overflowDialogIsOpen, setOverflowDialogIsOpen] = useState(false);
  const { tracks = [], title } = playlist;
  const marginBottom = isLastRow ? height + 16 : 16;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={() => setOverflowDialogIsOpen(true)}
      style={{
        flexDirection: "row",
        marginBottom,
        alignItems: "center",
        gap: 10,
      }}
    >
      <MosaicImage imageUrls={tracks.map((track) => track.artworkUrl)} />
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <Text numberOfLines={1} bold>
          {title}
        </Text>
        <Text numberOfLines={1}>
          {tracks.length} track{tracks.length > 1 ? "s" : ""}
        </Text>
      </View>
      <OverflowMenuDialog
        playlistTitle={playlist.title}
        playlistId={playlist.id}
        setIsOpen={setOverflowDialogIsOpen}
        isOpen={overflowDialogIsOpen}
      />
    </TouchableOpacity>
  );
};
