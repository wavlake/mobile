import { Image, View, StyleSheet } from "react-native";

export const HeaderTitleLogo = () => {
  return (
    <View>
      <Image
        style={styles.logo}
        source={require("../assets/wavlake-sm-header-icon.png")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 37,
    height: 31,
  },
});
