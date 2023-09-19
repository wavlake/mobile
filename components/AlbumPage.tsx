import { useLocalSearchParams } from "expo-router";
import { Center } from "@/components/Center";
import { Text } from "@/components/Text";

export const AlbumPage = () => {
  const { albumId } = useLocalSearchParams();

  return (
    <Center>
      <Text>Album page - {albumId}</Text>
    </Center>
  );
};
