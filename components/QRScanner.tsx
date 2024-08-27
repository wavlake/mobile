import { useEffect, useState } from "react";
import { Center, Text } from "@/components";
import { BarCodeScannedCallback, BarCodeScanner } from "expo-barcode-scanner";
import { DimensionValue } from "react-native";

export const QRScanner = ({
  onBarCodeScanned,
  width = "90%",
  height = "70%",
}: {
  onBarCodeScanned: BarCodeScannedCallback;
  width?: DimensionValue;
  height?: DimensionValue;
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  if (hasPermission === undefined) {
    return (
      <Center>
        <Text>Requesting camera permissions</Text>
      </Center>
    );
  }
  if (hasPermission === false) {
    return (
      <Center>
        <Text>No access to camera</Text>
      </Center>
    );
  }

  return (
    <BarCodeScanner
      onBarCodeScanned={onBarCodeScanned}
      style={{
        width: width,
        height: height,
        borderColor: "white",
        borderWidth: 1,
      }}
    />
  );
};
