import { View } from "react-native";
import { Button, Text, TextInput } from "@/components";
import { useState } from "react";
import { useCreatePlaylist } from "@/hooks";
import { useAddToPlaylist } from "@/hooks/playlist/useAddToPlaylist";

interface CreatePlaylistFormProps {
  back: () => void;
  contentId: string;
  setIsSuccess: () => void;
}

export const CreatePlaylistForm = ({
  back,
  contentId,
  setIsSuccess,
}: CreatePlaylistFormProps) => {
  const { mutateAsync: createPlaylist } = useCreatePlaylist();
  const { mutateAsync: addToPlaylist } = useAddToPlaylist();
  const [playlistName, setPlaylistName] = useState("");
  const handleCreate = async () => {
    const { id } = await createPlaylist(playlistName);
    const { success } = await addToPlaylist({
      playlistId: id,
      trackId: contentId,
    });
    success && setIsSuccess();
  };

  return (
    <View style={{ flex: 1, gap: 12, alignItems: "center" }}>
      <Text
        style={{
          fontSize: 18,
          paddingVertical: 12,
        }}
        numberOfLines={1}
        bold
      >
        Name your playlist
      </Text>
      <TextInput
        value={playlistName}
        keyboardType="default"
        onChangeText={setPlaylistName}
      />
      <Button onPress={handleCreate}>Create</Button>
    </View>
  );
};
