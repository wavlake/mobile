import { SearchBar as BaseSearchBar } from "@rneui/themed";
import { Platform } from "react-native";
import { useState } from "react";

export const SearchBar = () => {
  const [query, setQuery] = useState("");

  return (
    <BaseSearchBar
      platform={Platform.OS === "ios" ? "ios" : "android"}
      containerStyle={{
        backgroundColor: "transparent",
      }}
      inputContainerStyle={{ borderRadius: 16 }}
      onChangeText={setQuery}
      value={query}
    />
  );
};
