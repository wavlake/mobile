import {
  Keyboard,
  Modal,
  ModalProps,
  SafeAreaView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Text } from "@/components/Text";
import { WalletChooser } from "@/components/WalletChooser";
import { Button } from "@/components/Button";
import { CancelButton } from "@/components/CancelButton";
import { useState } from "react";
import { WalletKey } from "@/utils";
import { useSettingsManager } from "@/hooks";
import { useTheme } from "@react-navigation/native";
import { TextInput } from "./TextInput";

const DismissKeyboard = ({ children }: any) => (
  <TouchableWithoutFeedback
    onPress={() => {
      Keyboard.dismiss();
    }}
  >
    {children}
  </TouchableWithoutFeedback>
);
interface WalletChooserModalProps extends ModalProps {
  onContinue: () => void;
  onCancel: () => void;
}

export const WalletChooserModal = ({
  onContinue,
  onCancel,
  ...rest
}: WalletChooserModalProps) => {
  const { colors } = useTheme();
  const { settings, updateSettings } = useSettingsManager();
  const { enableNWC } = settings || {};
  const [defaultZapWallet, setDefaultZapWallet] =
    useState<WalletKey>("default");
  const [defaultZapAmount, setDefaultZapAmount] = useState("");
  const handleContinueClick = async () => {
    await updateSettings({ defaultZapWallet, defaultZapAmount });
    onContinue();
  };

  return (
    <Modal animationType="slide" {...rest}>
      <DismissKeyboard>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View
            style={{
              paddingHorizontal: 24,
              paddingVertical: 36,
              alignItems: "center",
              gap: 16,
            }}
          >
            <Text style={{ fontSize: 18 }} bold>
              Choose your default zap amount and lightning wallet
            </Text>
            <Text style={{ fontSize: 18 }}>
              This can be changed later in your Settings.
            </Text>
            <View style={{ marginVertical: 24, width: "100%" }}>
              <TextInput
                label="Default zap amount"
                value={defaultZapAmount}
                keyboardType="numeric"
                onChangeText={setDefaultZapAmount}
              />
              {/* if NWC is enabled, we don't need a default wallet to be set */}
              {!enableNWC && (
                <WalletChooser
                  selectedWallet={defaultZapWallet}
                  onSelectedWalletChange={setDefaultZapWallet}
                />
              )}
            </View>
            <Button onPress={handleContinueClick}>Continue</Button>
            <CancelButton onCancel={onCancel} />
          </View>
        </SafeAreaView>
      </DismissKeyboard>
    </Modal>
  );
};
