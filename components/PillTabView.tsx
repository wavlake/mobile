import { PropsWithChildren, useState } from "react";
import { Tab, TabView } from "@rneui/themed";
import { View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { brandColors } from "@/constants";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";

interface PillTabViewProps {
  searchShown?: boolean;
  tabNames: string[];
}

export const PillTabView = ({
  searchShown = false,
  tabNames,
  children,
}: PropsWithChildren<PillTabViewProps>) => {
  const [index, setIndex] = useState(0);
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const willShowSearchResults = searchQuery.length > 0;

  return (
    <>
      <View
        style={{
          width: 300,
          alignSelf: "center",
          paddingTop: 16,
          paddingBottom: searchShown ? 0 : 16,
        }}
      >
        <Tab
          value={index}
          onChange={setIndex}
          variant="primary"
          buttonStyle={(active) => ({
            backgroundColor: active
              ? brandColors.purple.DEFAULT
              : colors.background,
            borderRadius: 20,
            padding: 2,
          })}
          containerStyle={{ backgroundColor: colors.background }}
          dense
          style={{ backgroundColor: colors.background }}
          disableIndicator
          titleStyle={(active) => ({
            fontFamily: "Poppins_700Bold",
            fontSize: 16,
            color: active ? colors.background : colors.text,
          })}
        >
          {tabNames.map((name) => (
            <Tab.Item key={name} title={name} />
          ))}
        </Tab>
      </View>
      {searchShown && (
        <View style={{ padding: 8, paddingBottom: 0 }}>
          <SearchBar query={searchQuery} onChange={setSearchQuery} />
        </View>
      )}
      {willShowSearchResults ? (
        <SearchResults query={searchQuery} />
      ) : (
        <TabView
          value={index}
          onChange={setIndex}
          disableSwipe
          disableTransition
        >
          {children}
        </TabView>
      )}
    </>
  );
};

PillTabView.Item = TabView.Item;
