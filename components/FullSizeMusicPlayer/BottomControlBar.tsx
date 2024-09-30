import { LikeButton } from "../LikeButton";
import { PlaylistButton } from "../Playlist/PlaylistButton";
import { ShuffleButton } from "./ShuffleButton";
import { ShareButton } from "../ShareButton";
import { RepeatButton } from "./RepeatButton";
import { OverflowMenu } from "./OverflowMenu";
import {
  useAddTrackToLibrary,
  useDeleteTrackFromLibrary,
  useIsTrackInLibrary,
} from "@/hooks";
import { View } from "react-native";
import { useMusicPlayer } from "../MusicPlayerProvider";

export const BottomControlBar = ({}: {}) => {
  const { activeTrack } = useMusicPlayer();
  const {
    id: trackId,
    artistId,
    albumId,
    albumTitle,
    artist,
    title,
  } = activeTrack || {
    id: "",
    artistId: "",
    albumId: "",
    albumTitle: "",
    artist: "",
    title: "",
  };
  const isPodcast = albumTitle === "podcast";
  const isMusic = albumTitle !== "podcast";

  const isTrackInLibrary = useIsTrackInLibrary(trackId);
  const addTrackToLibraryMutation = useAddTrackToLibrary();
  const deleteTrackFromLibraryMutation = useDeleteTrackFromLibrary();
  const handleLikePress = async () => {
    if (!activeTrack) {
      return;
    }

    if (isTrackInLibrary) {
      deleteTrackFromLibraryMutation.mutate(trackId);
    } else {
      addTrackToLibraryMutation.mutate(activeTrack);
    }
  };
  const shareUrl = isPodcast
    ? `https://wavlake.com/episode/${trackId}`
    : `https://wavlake.com/track/${trackId}`;
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        <LikeButton
          onPress={handleLikePress}
          size={20}
          isLiked={isTrackInLibrary}
          isLoading={
            addTrackToLibraryMutation.isLoading ||
            deleteTrackFromLibraryMutation.isLoading
          }
          isMusic={isMusic}
        />
        <PlaylistButton
          size={24}
          contentId={activeTrack?.id}
          contentTitle={title}
          isMusic={isMusic}
        />
        <ShuffleButton size={20} />
        <View
          style={{
            flexGrow: 1,
          }}
        >
          <RepeatButton size={20} />
        </View>
        <ShareButton size={30} url={shareUrl} />
        {isMusic && (
          <View>
            <OverflowMenu
              size={20}
              artist={artist}
              artistId={artistId}
              albumTitle={albumTitle}
              albumId={albumId}
            />
          </View>
        )}
      </View>
    </View>
  );
};
