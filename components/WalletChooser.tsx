import { Picker } from "@react-native-picker/picker";
import { WalletKey, WALLETS } from "@/constants";
import { View } from "react-native";
import { Text } from "@/components/Text";

interface WalletChooserProps {
  selectedWallet: WalletKey;
  onSelectedWalletChange: (key: WalletKey) => void;
}

export const WalletChooser = ({
  selectedWallet,
  onSelectedWalletChange,
}: WalletChooserProps) => {
  return (
    <>
      <Text style={{ marginBottom: 4 }}>default zap wallet</Text>
      <View style={{ backgroundColor: "white", borderRadius: 8 }}>
        <Picker
          selectedValue={selectedWallet}
          onValueChange={(itemValue) => onSelectedWalletChange(itemValue)}
        >
          {Object.entries(WALLETS).map(([key, { displayName }]) => (
            <Picker.Item key={key} label={displayName} value={key} />
          ))}
        </Picker>
      </View>
    </>
  );
};
