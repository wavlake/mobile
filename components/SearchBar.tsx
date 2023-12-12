import { SearchBar as BaseSearchBar } from "@rneui/themed";
import { Platform } from "react-native";

interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
}

export const SearchBar = ({ query, onChange }: SearchBarProps) => {
  const iOS = Platform.OS === "ios";
  return (
    <BaseSearchBar
      platform={iOS ? "ios" : "android"}
      containerStyle={{
        backgroundColor: "transparent",
      }}
      inputContainerStyle={{
        borderRadius: 16,
        backgroundColor: "white",
        marginHorizontal: iOS ? 0 : 20,
        width: "auto",
      }}
      onChangeText={onChange}
      value={query}
    />
  );
};
