import { View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { Button } from "@/components";
import { UserPlaylists } from "@/utils";
import { useEffect, useState } from "react";
import { useAddToPlaylist } from "@/hooks/playlist/useAddToPlaylist";

interface ChoosePlaylistFormProps {
  playlists: UserPlaylists;
  contentId: string;
  onSuccess: () => void;
  back: () => void;
  setSelectedPlaylistTitle: (title: string) => void;
}

export const ChoosePlaylistForm = ({
  playlists,
  contentId,
  onSuccess,
  back,
  setSelectedPlaylistTitle,
}: ChoosePlaylistFormProps) => {
  const { colors } = useTheme();
  const [playlistId, setPlaylistId] = useState("");
  const { mutateAsync: addToPlaylist, isLoading } = useAddToPlaylist();
  const handlePress = async () => {
    if (!playlistId) return;
    const { success } = await addToPlaylist({
      playlistId,
      trackId: contentId,
    });
    success && onSuccess();
  };

  // initiliaze state to the first playlist in the list (this is the default selection)
  useEffect(() => {
    const defaultPlaylist = playlists[0];
    setPlaylistId(defaultPlaylist.id);
    setSelectedPlaylistTitle(defaultPlaylist.title);
  }, []);

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
                selectedPlaylist &&
                  setSelectedPlaylistTitle(selectedPlaylist.title);
                setPlaylistId(itemValue);
              }}
            >
              {playlists.map(({ id, title }) => (
                <Picker.Item key={id} label={title} value={id} />
              ))}
            </Picker>
          </View>
        )}
        <Button onPress={() => handlePress()} loading={isLoading}>
          Add to this playlist
        </Button>
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
