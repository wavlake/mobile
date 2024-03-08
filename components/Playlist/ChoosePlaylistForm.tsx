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
  setIsSuccess: () => void;
  back: () => void;
}

export const ChoosePlaylistForm = ({
  playlists,
  contentId,
  setIsSuccess,
  back,
}: ChoosePlaylistFormProps) => {
  const { colors } = useTheme();
  const [playlistId, setPlaylistId] = useState("");
  const { mutateAsync: addToPlaylist } = useAddToPlaylist();
  const handlePress = async () => {
    if (!playlistId) return;
    const { success } = await addToPlaylist({
      playlistId,
      trackId: contentId,
    });
    success && setIsSuccess();
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
              onValueChange={(itemValue) => setPlaylistId(itemValue)}
            >
              {playlists.map(({ id, title }) => (
                <Picker.Item key={id} label={title} value={id} />
              ))}
            </Picker>
          </View>
        )}
        <Button
          color={colors.border}
          titleStyle={{ color: colors.text }}
          onPress={() => handlePress()}
          width="100%"
        >
          Add to this playlist
        </Button>
        <Button onPress={back}>Back</Button>
      </View>
    </View>
  );
};
