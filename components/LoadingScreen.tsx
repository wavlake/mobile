import React from "react";
import { View, ActivityIndicator, StyleSheet, Modal } from "react-native";

const LoadingScreen = ({ loading }: { loading: boolean }) => {
  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={loading}
      onRequestClose={() => {}}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "space-around",
          backgroundColor: "#00000080",
        }}
      >
        <View
          style={{
            height: 100,
            width: 100,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <ActivityIndicator animating={loading} size="large" />
        </View>
      </View>
    </Modal>
  );
};

export default LoadingScreen;
