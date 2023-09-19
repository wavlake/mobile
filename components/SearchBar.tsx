import { SearchBar as BaseSearchBar } from "@rneui/themed";
import { Platform } from "react-native";

interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
}

export const SearchBar = ({ query, onChange }: SearchBarProps) => {
  return (
    <BaseSearchBar
      platform={Platform.OS === "ios" ? "ios" : "android"}
      containerStyle={{
        backgroundColor: "transparent",
      }}
      inputContainerStyle={{ borderRadius: 16 }}
      onChangeText={onChange}
      value={query}
    />
  );
};
