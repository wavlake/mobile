import { Dialog } from "@rneui/themed";
import { View, StyleSheet, Dimensions, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Button, Text, TextInput } from "@/components";
import { useState } from "react";
import { getKeysFromNostrSecret } from "@/utils";

export const EditNsecModal = ({
  isOpen,
  onClose,
  onSave,
  currentPubkey,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nsec: string) => Promise<void>;
  currentPubkey: string;
}) => {
  const screenWidth = Dimensions.get("window").width;
  const { colors } = useTheme();
  const [nsec, setNsec] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!nsec) {
      setError("Please enter your nsec");
      return;
    }

    const keys = getKeysFromNostrSecret(nsec);
    if (!keys) {
      setError("Invalid nsec format");
      return;
    }

    if (keys.pubkey !== currentPubkey) {
      Alert.alert(
        "Different Identity",
        "This nsec belongs to a different Nostr identity. Continuing will change your identity and you'll lose access to your current account. Are you sure?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Continue",
            style: "destructive",
            onPress: () => submitNsec(),
          },
        ],
      );
      return;
    }

    await submitNsec();
  };

  const submitNsec = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      await onSave(nsec);
      setNsec("");
      onClose();
    } catch (error) {
      setError("Failed to update nsec. Please try again.");
      console.error("Failed to update nsec:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNsec("");
    setError("");
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
        <Text style={styles.title} bold>
          Update Nostr Private Key
        </Text>
        <TextInput
          label="Enter your nsec"
          value={nsec}
          onChangeText={(text) => {
            setNsec(text);
            setError("");
          }}
          secureTextEntry
          placeholder="nsec1..."
          errorMessage={error}
        />
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSave}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Save
          </Button>
          <Button color="white" onPress={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </View>
      </View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    borderRadius: 8,
    padding: 24,
  },
  modalBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    alignItems: "center",
  },
});
