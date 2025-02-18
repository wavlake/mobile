import { Text } from "../shared/Text";
import { ActivityIndicator, View } from "react-native";

export const ListEmpty = ({ isLoading }: { isLoading: boolean }) => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text
      style={{
        fontSize: 16,
        color: "white",
        textAlign: "center",
      }}
    >
      {isLoading ? <ActivityIndicator /> : "No messages yet"}
    </Text>
  </View>
);

export const ItemSeparator = () => (
  <View
    style={{
      height: 1,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      marginVertical: 6,
    }}
  />
);

export const ListFooter = ({ numberOfItems }: { numberOfItems: number }) => (
  <Text style={{ textAlign: "center", marginTop: 40 }}>
    {numberOfItems === 0 ? "" : "End of inbox"}
  </Text>
);
