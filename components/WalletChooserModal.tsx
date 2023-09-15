import { Modal, ModalProps, SafeAreaView, View } from "react-native";
import { Text } from "@/components/Text";
import { WalletChooser } from "@/components/WalletChooser";
import { Button } from "@/components/Button";
import { CancelButton } from "@/components/CancelButton";
import { useState } from "react";
import { cacheDefaultZapWallet, WalletKey } from "@/utils";
import { useAuth } from "@/hooks";
import { useTheme } from "@react-navigation/native";

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
  const [defaultZapWallet, setDefaultZapWallet] =
    useState<WalletKey>("default");
  const handleContinueClick = async () => {
    await cacheDefaultZapWallet(defaultZapWallet, pubkey);
    onContinue();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Modal animationType="slide" {...rest}>
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 36,
            alignItems: "center",
            gap: 16,
          }}
        >
          <Text style={{ fontSize: 18 }} bold>
            Choose your default lightning wallet
          </Text>
          <Text style={{ fontSize: 18 }}>
            This can be changed later in your Settings.
          </Text>
          <View style={{ marginVertical: 24, width: "100%" }}>
            <WalletChooser
              selectedWallet={defaultZapWallet}
              onSelectedWalletChange={setDefaultZapWallet}
            />
          </View>
          <Button onPress={handleContinueClick}>Continue</Button>
          <CancelButton onCancel={onCancel} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};
