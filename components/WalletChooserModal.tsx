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
import { cacheSettings, WalletKey } from "@/utils";
import { useAuth } from "@/hooks";
import { useTheme } from "@react-navigation/native";
import { TextInput } from "./TextInput";
import { useUser } from "./UserContextProvider";
import { Switch } from "@rneui/themed";
import { brandColors } from "@/constants";

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
  const { pubkey } = useAuth();
  const { catalogUser } = useUser();
  const [defaultZapWallet, setDefaultZapWallet] =
    useState<WalletKey>("default");
  const [defaultZapAmount, setDefaultZapAmount] = useState("");
  const handleContinueClick = async () => {
    await cacheSettings({ defaultZapWallet, defaultZapAmount }, pubkey);
    onContinue();
  };
  const [enableWavlakeWallet, setEnableWavlakeWallet] = useState(
    catalogUser?.isRegionVerified ?? false,
  );

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
              {catalogUser?.isRegionVerified && (
                <View
                  style={{
                    marginBottom: 24,
                    flexDirection: "row",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text bold>Use Wavlake Wallet</Text>
                    <Text>
                      {enableWavlakeWallet
                        ? "Disable to use a different wallet."
                        : "Enable to use your wavlake wallet."}
                    </Text>
                  </View>
                  <Switch
                    value={enableWavlakeWallet}
                    onValueChange={setEnableWavlakeWallet}
                    color={brandColors.pink.DEFAULT}
                    trackColor={{
                      false: colors.border,
                      true: brandColors.pink.DEFAULT,
                    }}
                    thumbColor={colors.text}
                  />
                </View>
              )}
              <WalletChooser
                selectedWallet={defaultZapWallet}
                onSelectedWalletChange={setDefaultZapWallet}
                enabled={!enableWavlakeWallet}
              />
            </View>
            <Button onPress={handleContinueClick}>Continue</Button>
            <CancelButton onCancel={onCancel} />
          </View>
        </SafeAreaView>
      </DismissKeyboard>
    </Modal>
  );
};
