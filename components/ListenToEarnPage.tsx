import { FlatList } from "react-native";

export const ListenToEarnPage = () => {
  return (
    <FlatList data={[]} renderItem={() => null} keyExtractor={() => "key"} />
  );
};
