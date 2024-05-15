import { Picker } from "@react-native-picker/picker";
import { WalletKey, WALLETS } from "@/utils";
import { View } from "react-native";
import { Text } from "@/components/Text";

interface WalletChooserProps {
  enabled: boolean;
  selectedWallet: WalletKey;
  onSelectedWalletChange: (key: WalletKey) => void;
}

export const WalletChooser = ({
  enabled,
  selectedWallet,
  onSelectedWalletChange,
}: WalletChooserProps) => {
  return (
    <View style={{ width: "100%" }}>
      <Text style={{ marginBottom: 4 }} bold>
        Default zap wallet
      </Text>
      <View style={{ backgroundColor: "white", borderRadius: 8 }}>
        <Picker
          selectedValue={selectedWallet}
          onValueChange={(itemValue) =>
            // dont change this value if the picker is disabled
            itemValue && onSelectedWalletChange(itemValue)
          }
        >
          {enabled ? (
            Object.entries(WALLETS).map(([key, { displayName }]) => (
              <Picker.Item key={key} label={displayName} value={key} />
            ))
          ) : (
            <Picker.Item label="Wavlake Wallet" value={undefined} />
          )}
        </Picker>
      </View>
    </View>
  );
};
