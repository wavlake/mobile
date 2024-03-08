import { Dimensions, Pressable, View } from "react-native";
import { Dialog } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/hooks";
import { useEffect, useState } from "react";
import { brandColors } from "@/constants";
import { Button } from "@/components/Button";
import { CreatePlaylistButton } from "./CreatePlaylistButton";
import { Picker } from "@react-native-picker/picker";
import { usePlaylists } from "@/hooks/playlist/usePlaylists";
import { useAddToPlaylist } from "@/hooks/playlist/useAddToPlaylist";

interface PlaylistButtonProps {
  size: number;
  contentId: string;
  isMusic: boolean;
}

export const PlaylistButton = ({
  size,
  contentId,
  isMusic,
}: PlaylistButtonProps) => {
  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const [selectedContentId, setSelectedContentId] = useState("");
  const screenWidth = Dimensions.get("window").width;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: playlists } = usePlaylists();
  const { mutate: addToPlaylist } = useAddToPlaylist();
  const [playlist, setPlaylist] = useState("");

  useEffect(() => {
    if (playlist) {
      addToPlaylist({ playlistId: playlist, trackId: selectedContentId });
      setIsDialogOpen(false);
    }
  }, [playlist]);

  if (!pubkey) return;

  return (
    <View style={{ backgroundColor: colors.background }}>
      {isMusic && (
        <Pressable
          onPress={() => {
            // grab the contentId (it may change if the next track plays)
            setSelectedContentId(contentId);
            setIsDialogOpen(true);
          }}
        >
          <MaterialCommunityIcons
            name={"playlist-plus"}
            size={size}
            color={colors.text}
          />
        </Pressable>
      )}
      <Dialog
        isVisible={isDialogOpen}
        onBackdropPress={() => setIsDialogOpen(false)}
        overlayStyle={{
          backgroundColor: colors.background,
          width: screenWidth - 32,
          paddingVertical: 32,
        }}
        backdropStyle={{
          backgroundColor: brandColors.black.light,
          opacity: 0.8,
        }}
      >
        <View style={{ gap: 32 }}>
          {!!playlists?.length && (
            <View style={{ backgroundColor: "white", borderRadius: 8 }}>
              <Picker
                selectedValue={playlist}
                onValueChange={(itemValue) => setPlaylist(itemValue)}
              >
                {playlists.map(({ id, title }) => (
                  <Picker.Item key={id} label={title} value={id} />
                ))}
              </Picker>
            </View>
          )}
          <CreatePlaylistButton />
          <Button
            color={colors.border}
            titleStyle={{ color: colors.text }}
            onPress={() => setIsDialogOpen(false)}
            width="100%"
          >
            Close
          </Button>
        </View>
      </Dialog>
    </View>
  );
};
