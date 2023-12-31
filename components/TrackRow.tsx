import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/Text";
import { SatsEarned } from "@/components/SatsEarned";
import { SquareArtwork } from "@/components/SquareArtwork";
import { LikeButton } from "@/components/LikeButton";
import {
  useAddTrackToLibrary,
  useDeleteTrackFromLibrary,
  useIsTrackInLibrary,
} from "@/hooks";
import { Track } from "@/utils";

interface TrackRowProps {
  track: Track;
  descriptor: string;
  onPress: () => void;
  willDisplaySatsEarned?: boolean;
  willDisplayLikeButton?: boolean;
}

export const TrackRow = ({
  track,
  descriptor,
  onPress,
  willDisplaySatsEarned = true,
  willDisplayLikeButton = true,
}: TrackRowProps) => {
  const { id, title, msatTotal, artworkUrl } = track;
  const isTrackInLibrary = useIsTrackInLibrary(id);
  const addTrackToLibraryMutation = useAddTrackToLibrary();
  const deleteTrackFromLibraryMutation = useDeleteTrackFromLibrary();
  const handleLikePress = () => {
    if (isTrackInLibrary) {
      deleteTrackFromLibraryMutation.mutate(id);
    } else {
      addTrackToLibraryMutation.mutate(track);
    }
  };

  return (
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          height: 60,
          paddingRight: 16,
          flexDirection: "row",
          flex: 1,
          alignItems: "center",
        }}
      >
        {artworkUrl && <SquareArtwork size={60} url={artworkUrl} />}
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={{ fontSize: 18 }} numberOfLines={1} bold>
            {title}
          </Text>
          <Text numberOfLines={1}>{descriptor}</Text>
          {willDisplaySatsEarned && <SatsEarned msats={msatTotal} />}
        </View>
      </TouchableOpacity>
      {willDisplayLikeButton && (
        <View
          style={{
            marginRight: 16,
            justifyContent: "center",
          }}
        >
          <LikeButton
            onPress={handleLikePress}
            size={32}
            isLiked={isTrackInLibrary}
            isLoading={
              addTrackToLibraryMutation.isLoading ||
              deleteTrackFromLibraryMutation.isLoading
            }
          />
        </View>
      )}
    </View>
  );
};
