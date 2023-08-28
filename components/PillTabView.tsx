import { PropsWithChildren, useState } from "react";
import { Tab, TabView } from "@rneui/themed";
import { View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { brandColors } from "@/constants";
import { SearchBar } from "./SearchBar";

interface PillTabViewProps {
  searchShown?: boolean;
}

export const PillTabView = ({
  searchShown = false,
  children,
}: PropsWithChildren<PillTabViewProps>) => {
  const [index, setIndex] = useState(0);
  const { colors } = useTheme();

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
          disableIndicator
          titleStyle={(active) => ({
            fontFamily: "Poppins_700Bold",
            fontSize: 16,
            color: active ? colors.background : colors.text,
          })}
        >
          <Tab.Item title="Music" />
          <Tab.Item title="Podcasts" />
        </Tab>
      </View>
      {searchShown && (
        <View style={{ padding: 8 }}>
          <SearchBar />
        </View>
      )}
      <TabView
        value={index}
        onChange={setIndex}
        animationType="spring"
        disableSwipe
        disableTransition
      >
        {children}
      </TabView>
    </>
  );
};

PillTabView.Item = TabView.Item;
