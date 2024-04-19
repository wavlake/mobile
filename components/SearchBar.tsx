import { SearchBar as BaseSearchBar, Icon } from "@rneui/themed";
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
      searchIcon={<Icon name="search" />}
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
