import { View } from "react-native";
import { Button, Text, TextInput } from "@/components";
import { useState } from "react";
import { useCreatePlaylist } from "@/hooks";
import { useAddToPlaylist } from "@/hooks/playlist/useAddToPlaylist";
import { useTheme } from "@react-navigation/native";

interface CreatePlaylistFormProps {
  back: () => void;
  contentId: string;
  onSuccess: () => void;
}

export const CreatePlaylistForm = ({
  back,
  contentId,
  onSuccess,
}: CreatePlaylistFormProps) => {
  const { colors } = useTheme();
  const { mutateAsync: createPlaylist } = useCreatePlaylist();
  const { mutateAsync: addToPlaylist } = useAddToPlaylist();
  const [playlistName, setPlaylistName] = useState("");
  const handleCreate = async () => {
    const { id } = await createPlaylist(playlistName);
    if (!id) return;

    const { success } = await addToPlaylist({
      playlistId: id,
      trackId: contentId,
    });
    success && onSuccess();
  };

  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          paddingVertical: 4,
        }}
        numberOfLines={1}
        bold
      >
        Name your new playlist
      </Text>
      <TextInput
        value={playlistName}
        keyboardType="default"
        onChangeText={setPlaylistName}
      />
      <Button onPress={handleCreate}>Create</Button>
      <Button
        titleStyle={{ color: colors.text }}
        color={colors.border}
        onPress={back}
      >
        Back
      </Button>
    </View>
  );
};
