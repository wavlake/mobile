import { StyleSheet, View, ViewProps } from "react-native";

interface CenterProps extends ViewProps {}

export const Center = ({ children, style, ...rest }: CenterProps) => {
  return (
    <View {...rest} style={[style, styles.container]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
