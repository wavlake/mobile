import { useLocalSearchParams } from "expo-router";
import { Center } from "@/components/Center";
import { Text } from "@/components/Text";

export const ArtistPage = () => {
  const { artistId } = useLocalSearchParams();

  return (
    <Center>
      <Text>Artist page - {artistId}</Text>
    </Center>
  );
};
