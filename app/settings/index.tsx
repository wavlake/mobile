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
import { useEffect, useState } from "react";
import { useAuth, useToast, useSettingsManager, useDebounce } from "@/hooks";
import { BUILD_NUM, VERSION } from "@/app.config";
import AntDesign from "@expo/vector-icons/AntDesign";
import { brandColors } from "@/constants";
import { Tooltip } from "@rneui/themed";
import { useTheme } from "@react-navigation/native";
import { PrivateUserData, useEditUser } from "@/utils";
import { useValidateUsername } from "@/hooks/useValidateUsername";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultZapAmount: string;
  catalogUser?: PrivateUserData;
  onSave: (name: string, amount: string) => Promise<void>;
}

// Components
const VersionDisplay = () => (
  <View style={styles.centerContainer}>
    <Text bold>Version</Text>
    <Text>
      {VERSION} ({BUILD_NUM})
    </Text>
  </View>
);

const LightningAddressDisplay: React.FC<{ username?: string }> = ({
  username,
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  if (!username) return null;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle} bold>
        Wavlake Lightning Address:
      </Text>
      <Text style={styles.centerText}>{username}@wavlake.com</Text>
      <Tooltip
        visible={isTooltipVisible}
        onOpen={() => setIsTooltipVisible(true)}
        onClose={() => setIsTooltipVisible(false)}
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

const UserInfoDisplay: React.FC<{
  catalogUser?: PrivateUserData;
  defaultZapAmount?: string;
  onEditPress: () => void;
}> = ({ catalogUser, defaultZapAmount, onEditPress }) => (
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
      onPress={onEditPress}
      style={styles.editButton}
      width={160}
    >
      Edit Details
    </Button>
  </View>
);

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  defaultZapAmount,
  catalogUser,
  onSave,
}) => {
  const [amount, setAmount] = useState(defaultZapAmount ?? "21");
  const [name, setName] = useState(catalogUser?.name ?? "");
  const [errors, setErrors] = useState({ username: "", amount: "" });
  const { colors } = useTheme();
  const { refetch: checkUsername } = useValidateUsername(name);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    setAmount(defaultZapAmount ?? "21");
    setName(catalogUser?.name ?? "");
  }, [catalogUser, defaultZapAmount]);

  const validateForm = async (): Promise<boolean> => {
    const newErrors = { username: "", amount: "" };
    let isValid = true;

    if (catalogUser?.name !== name) {
      if (name && !name.match(/^[a-zA-Z0-9-_]+$/)) {
        newErrors.username =
          "Username can only contain letters, numbers, hyphens, and underscores";
        isValid = false;
      } else {
        const result = await checkUsername();
        if (!result.data?.success) {
          newErrors.username = "Username unavailable, please try another";
          isValid = false;
        }
      }
    }

    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = "Please enter a valid positive number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!(await validateForm())) return;

    try {
      await onSave(name, amount);
      Keyboard.dismiss();
      onClose();
    } catch (error) {
      setErrors((prev) => ({ ...prev, amount: "Failed to save changes" }));
      console.error("Failed to save changes:", error);
    }
  };

  const handleClose = () => {
    setErrors({ username: "", amount: "" });
    onClose();
  };

  return (
    <Dialog
      isVisible={isOpen}
      onBackdropPress={handleClose}
      overlayStyle={[
        styles.modalOverlay,
        { backgroundColor: colors.background, width: screenWidth - 32 },
      ]}
      backdropStyle={styles.modalBackdrop}
    >
      <View style={styles.modalContent}>
        {catalogUser && (
          <TextInput
            label="Username"
            value={name}
            onChangeText={setName}
            errorMessage={errors.username}
          />
        )}
        <TextInput
          label="Default zap amount"
          placeholder="Enter amount in sats"
          value={amount}
          keyboardType="numeric"
          onChangeText={setAmount}
          errorMessage={errors.amount}
        />
        <Button color="pink" onPress={handleSave}>
          Save
        </Button>
        <Button color="white" onPress={handleClose}>
          Cancel
        </Button>
      </View>
    </Dialog>
  );
};

const ProfileSection: React.FC<{ catalogUser?: PrivateUserData }> = ({
  catalogUser,
}) => {
  const { settings, updateSettings } = useSettingsManager();
  const [isEditing, setIsEditing] = useState(false);
  const { mutateAsync: updateUser } = useEditUser();
  const toast = useToast();

  const handleSave = async (name: string, amount: string) => {
    try {
      const updates: Promise<any>[] = [];

      if (settings?.defaultZapAmount !== amount) {
        updates.push(updateSettings({ defaultZapAmount: amount }));
      }

      if (catalogUser && catalogUser.name !== name) {
        updates.push(updateUser({ name }));
      }

      await Promise.all(updates);
      toast.show("Saved");
    } catch (error) {
      console.error("Error saving changes:", error);
      throw error;
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} bold>
        Profile
      </Text>
      <ProfileImagePicker />

      <UserInfoDisplay
        catalogUser={catalogUser}
        defaultZapAmount={settings?.defaultZapAmount}
        onEditPress={() => setIsEditing(true)}
      />

      {catalogUser?.isRegionVerified && catalogUser.emailVerified && (
        <LightningAddressDisplay username={catalogUser.profileUrl} />
      )}

      <EditModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        defaultZapAmount={settings?.defaultZapAmount ?? "21"}
        catalogUser={catalogUser}
        onSave={handleSave}
      />
    </View>
  );
};

// Main Component
export default function SettingsPage() {
  const router = useRouter();
  const { userIsLoggedIn: pubkeyLoggedIn } = useAuth();
  const { catalogUser } = useUser();
  const userIsLoggedIn = pubkeyLoggedIn || !!catalogUser;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <VersionDisplay />

          {userIsLoggedIn && <ProfileSection catalogUser={catalogUser} />}

          <TouchableOpacity
            hitSlop={20}
            onPress={() => router.push({ pathname: "/settings/advanced" })}
          >
            <Text bold>Advanced Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  content: {
    flexDirection: "column",
    alignItems: "center",
    gap: 40,
  },
  centerContainer: {
    alignItems: "center",
  },
  section: {
    width: "100%",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  centerText: {
    textAlign: "center",
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
    padding: 16,
  },
  modalBackdrop: {
    backgroundColor: brandColors.black.light,
    opacity: 0.8,
  },
  modalContent: {
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
  },
});
