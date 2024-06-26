import { ScrollView, TouchableOpacity, View } from "react-native";
import { SectionHeader } from "@/components/SectionHeader";
import { Divider } from "@rneui/themed";
import { useQuery } from "@tanstack/react-query";
import { getGenres } from "@/utils";
import { brandColors } from "@/constants";
import { Text } from "@/components/Text";
import { useRouter } from "expo-router";
import { useMiniMusicPlayer } from "@/components/MiniMusicPlayerProvider";

export const GenresSection = () => {
  const { data = [] } = useQuery({
    queryKey: ["genres"],
    queryFn: () => getGenres(),
  });
  const router = useRouter();
  const { height } = useMiniMusicPlayer();
  const handleRowPress = async (genreId: number, name: string) => {
    return router.push({
      pathname: `/search/genre/[genreId]`,
      params: { genreId, name, headerTitle: name, includeBackButton: "true" },
    });
  };

  return (
    <ScrollView
      style={{ padding: 16, paddingTop: 0, marginBottom: height + 16 }}
    >
      <SectionHeader title="Genres" />
      <Divider />
      {data.map((item, index) => {
        const { id, name } = item;
        const willShowDivider = index < data.length - 1;

        return (
          <View key={id}>
            <TouchableOpacity
              onPress={() => handleRowPress(id, name)}
              style={{
                justifyContent: "center",
                paddingVertical: 12,
              }}
            >
              <Text style={{ fontSize: 18 }} numberOfLines={1}>
                {name}
              </Text>
            </TouchableOpacity>
            {willShowDivider && <Divider color={brandColors.black.light} />}
          </View>
        );
      })}
    </ScrollView>
  );
};
