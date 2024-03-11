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
  selectedPlaylistTitle: string;
  setSelectedPlaylistTitle: (title: string) => void;
}

export const CreatePlaylistForm = ({
  back,
  contentId,
  onSuccess,
  selectedPlaylistTitle,
  setSelectedPlaylistTitle,
}: CreatePlaylistFormProps) => {
  const { colors } = useTheme();
  const { mutateAsync: createPlaylist } = useCreatePlaylist();
  const { mutateAsync: addToPlaylist } = useAddToPlaylist();
  const handleCreate = async () => {
    const { id } = await createPlaylist(selectedPlaylistTitle);
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
        value={selectedPlaylistTitle}
        keyboardType="default"
        onChangeText={setSelectedPlaylistTitle}
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
