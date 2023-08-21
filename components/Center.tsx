import { StyleSheet, View } from "react-native";
import { PropsWithChildren } from "react";

export const Center = ({ children }: PropsWithChildren) => {
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
