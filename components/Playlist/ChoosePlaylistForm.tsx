import { View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { Button } from "@/components";
import { Playlist } from "@/utils";
import { useState } from "react";
import { useAddToPlaylist } from "@/hooks/playlist/useAddToPlaylist";

interface ChoosePlaylistFormProps {
  playlists: Playlist[];
  contentId: string;
  onSuccess: () => void;
  back: () => void;
  setSelectedPlaylist: (value: Playlist) => void;
}

export const ChoosePlaylistForm = ({
  playlists,
  contentId,
  onSuccess,
  back,
  setSelectedPlaylist,
}: ChoosePlaylistFormProps) => {
  const { colors } = useTheme();
  const [playlistId, setPlaylistId] = useState(playlists[0]?.id);
  const { mutateAsync: addToPlaylist } = useAddToPlaylist();
  const handlePress = async () => {
    if (!playlistId) return;
    const { success } = await addToPlaylist({
      playlistId,
      trackId: contentId,
    });
    success && onSuccess();
  };
  return (
    <View style={{ backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {!!playlists?.length && (
          <View
            style={{ backgroundColor: "white", borderRadius: 8, width: "100%" }}
          >
            <Picker
              selectedValue={playlistId}
              onValueChange={(itemValue) => {
                const selectedPlaylist = playlists.find(
                  ({ id }) => id === itemValue,
                );
                selectedPlaylist && setSelectedPlaylist(selectedPlaylist);
                setPlaylistId(itemValue);
              }}
            >
              {playlists.map(({ id, title }) => (
                <Picker.Item key={id} label={title} value={id} />
              ))}
            </Picker>
          </View>
        )}
        <Button onPress={() => handlePress()}>Add to this playlist</Button>
        <Button
          titleStyle={{ color: colors.text }}
          color={colors.border}
          onPress={back}
        >
          Back
        </Button>
      </View>
    </View>
  );
};
