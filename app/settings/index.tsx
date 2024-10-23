import {
  Text,
  TextInput,
  Button,
  useUser,
  ProfileImagePicker,
} from "@/components";
import { Dialog } from "@rneui/themed";
import { useRouter } from "expo-router";
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { useAuth, useToast, useSettingsManager } from "@/hooks";
import { BUILD_NUM, VERSION } from "@/app.config";
import AntDesign from "@expo/vector-icons/AntDesign";
import { brandColors } from "@/constants";
import { Tooltip } from "@rneui/themed";
import { useTheme } from "@react-navigation/native";

import { PrivateUserData } from "@/utils";

const VersionDisplay = () => (
  <View style={styles.centerContainer}>
    <Text bold>Version</Text>
    <Text>
      {VERSION} ({BUILD_NUM})
    </Text>
  </View>
);

const ProfileSection = ({ onEditProfile }: { onEditProfile: () => void }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.centerText} bold>
      Profile Picture
    </Text>
    <ProfileImagePicker />
    {/* <Button color="white" onPress={onEditProfile} width={160}>
      Update
    </Button> */}
  </View>
);

const UserInfoSection = ({
  catalogUser,
  onEditDetails,
  defaultZapAmount,
}: {
  catalogUser: PrivateUserData;
  onEditDetails: () => void;
  defaultZapAmount: string;
}) => (
  <View style={styles.sectionContainer}>
    {catalogUser?.name && (
      <>
        <Text>Username:</Text>
        <View style={styles.infoBox}>
          <Text style={styles.centerText}>{catalogUser.name}</Text>
        </View>
      </>
    )}
    <Text>Zap default:</Text>
    <View style={styles.infoBox}>
      <Text style={styles.centerText}>
        {defaultZapAmount ? `${defaultZapAmount} sats` : "Please set an amount"}
      </Text>
    </View>
    <Button
      color="white"
      onPress={onEditDetails}
      style={styles.editButton}
      width={160}
    >
      Edit Details
    </Button>
  </View>
);

const LightningAddressSection = ({
  catalogUser,
  onInfoPress,
  isTooltipVisible,
  onTooltipClose,
}: {
  catalogUser: PrivateUserData;
  onInfoPress: () => void;
  isTooltipVisible: boolean;
  onTooltipClose: () => void;
}) => {
  if (!catalogUser?.isRegionVerified || !catalogUser.emailVerified) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle} bold>
        Wavlake Lightning Address:
      </Text>
      <Text style={styles.centerText}>
        {catalogUser.profileUrl}@wavlake.com
      </Text>
      <Tooltip
        visible={isTooltipVisible}
        onOpen={onInfoPress}
        onClose={onTooltipClose}
        popover={
          <Text>
            Your Wavlake Lightning Address is active with your username as the
            identifier. This is a standard LNURL address you can share with
            others to receive payments to your Wavlake wallet.
          </Text>
        }
        backgroundColor={brandColors.black.DEFAULT}
        containerStyle={styles.tooltipContainer}
        width={200}
        withOverlay={false}
      >
        <View style={styles.tooltipTrigger}>
          <Text style={styles.activeText} bold>
            Active
          </Text>
          <AntDesign name="questioncircle" size={20} color="white" />
        </View>
      </Tooltip>
    </View>
  );
};

// components/ZapAmountModal.tsx
type ZapAmountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultValue?: string;
  onSave: (amount: string) => Promise<void>;
};

const ZapAmountModal = ({
  isOpen,
  onClose,
  defaultValue = "",
  onSave,
}: ZapAmountModalProps) => {
  const screenWidth = Dimensions.get("window").width;
  const { colors } = useTheme();
  const toast = useToast();
  const [amount, setAmount] = useState(defaultValue);

  const handleSave = async () => {
    const parsedInt = parseInt(amount);
    if (isNaN(parsedInt)) {
      toast.show("Please enter a valid number");
      return;
    }

    try {
      await onSave(parsedInt.toString());
      onClose();
    } catch (error) {
      toast.show("Failed to save zap amount");
      console.error("Failed to save zap amount:", error);
    }
  };

  return (
    <Dialog
      isVisible={isOpen}
      onBackdropPress={onClose}
      overlayStyle={[
        styles.modalOverlay,
        { backgroundColor: colors.background, width: screenWidth - 32 },
      ]}
      backdropStyle={styles.modalBackdrop}
    >
      <View style={styles.modalContent}>
        <TextInput
          label="Default zap amount"
          value={amount}
          keyboardType="numeric"
          onChangeText={setAmount}
        />
        <Button color="white" onPress={handleSave}>
          Save
        </Button>
      </View>
    </Dialog>
  );
};

// styles.ts
const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 40,
  },
  centerContainer: {
    alignItems: "center",
  },
  sectionContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  centerText: {
    textAlign: "center",
  },
  sectionTitle: {
    paddingBottom: 10,
  },
  infoBox: {
    backgroundColor: brandColors.black.DEFAULT,
    padding: 6,
    borderRadius: 6,
    minWidth: 250,
  },
  editButton: {
    paddingTop: 10,
  },
  tooltipContainer: {
    padding: 10,
    width: 200,
    height: 200,
  },
  tooltipTrigger: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  activeText: {
    textAlign: "center",
    color: "green",
  },
  modalOverlay: {
    borderRadius: 8,
  },
  modalBackdrop: {
    backgroundColor: brandColors.black.light,
    opacity: 0.8,
  },
  modalContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
  },
});

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { userIsLoggedIn: pubkeyLoggedIn } = useAuth();
  const { catalogUser } = useUser();
  const [lnurlInfoOpen, setLnurlInfoOpen] = useState(false);
  const [isZapDefaultOpen, setIsZapDefaultOpen] = useState(false);
  const { settings, updateSettings } = useSettingsManager();
  const userIsLoggedIn = pubkeyLoggedIn || !!catalogUser;
  const handleSaveZapAmount = async (amount: string) => {
    toast.clearAll();
    Keyboard.dismiss();
    await updateSettings({ defaultZapAmount: amount });
    toast.show("Saved");
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <VersionDisplay />
          {userIsLoggedIn && (
            <ProfileSection
              onEditProfile={() =>
                router.push({ pathname: "/settings/edit-profile" })
              }
            />
          )}
          {catalogUser && (
            <>
              <UserInfoSection
                catalogUser={catalogUser}
                onEditDetails={() => setIsZapDefaultOpen(true)}
                defaultZapAmount={settings?.defaultZapAmount ?? ""}
              />
              <LightningAddressSection
                catalogUser={catalogUser}
                onInfoPress={() => setLnurlInfoOpen(true)}
                isTooltipVisible={lnurlInfoOpen}
                onTooltipClose={() => setLnurlInfoOpen(false)}
              />
            </>
          )}
          <TouchableOpacity
            hitSlop={20}
            onPress={() => router.push({ pathname: "/settings/advanced" })}
          >
            <View style={{ flexGrow: 1 }}>
              <Text bold>Advanced Settings</Text>
            </View>
          </TouchableOpacity>
        </View>
        <ZapAmountModal
          isOpen={isZapDefaultOpen}
          onClose={() => setIsZapDefaultOpen(false)}
          defaultValue={settings?.defaultZapAmount}
          onSave={handleSaveZapAmount}
        />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
