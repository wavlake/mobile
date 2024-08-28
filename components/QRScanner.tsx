import React, { useEffect } from "react";
import { Button, Center, Text } from "@/components";
import { DimensionValue, View } from "react-native";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";

export const QRScanner = ({
  onBarCodeScanned,
  width = "90%",
  height = "70%",
}: {
  onBarCodeScanned?: (scanningResult: BarcodeScanningResult) => void;
  width?: DimensionValue;
  height?: DimensionValue;
}) => {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
      return;
    }
  }, []);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <Center>
        <Text>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </Center>
    );
  }

  return (
    <CameraView
      facing={"back"}
      barcodeScannerSettings={{
        barcodeTypes: ["qr"],
      }}
      style={{
        width: width,
        height: height,
        borderColor: "white",
        borderWidth: 1,
      }}
      onBarcodeScanned={onBarCodeScanned}
    />
  );
};
