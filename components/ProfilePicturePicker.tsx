import { Modal, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Image, StyleSheet } from "react-native";
import { Text } from "./shared/Text";
import { LoggedInUserAvatar } from "./LoggedInUserAvatar";
import AntDesign from "@expo/vector-icons/AntDesign";
import { brandColors } from "@/constants";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { useEditUser, useToast, useUser } from "@/hooks";
import { getImageDisclosure, setImageDisclosure } from "@/utils";

export const ProfileImagePicker = () => {
  const refreshWithKey = () => {
    setImageKey((prev) => prev + 1);
  };
  const [imageKey, setImageKey] = useState(0);
  const { catalogUser } = useUser();
  const currentImage = catalogUser?.artworkUrl;
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: savePicture } = useEditUser();
  const toast = useToast();
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [hasAcceptedDisclosure, setHasAcceptedDisclosure] = useState(false);

  useEffect(() => {
    checkDisclosureStatus();
  }, []);

  const checkDisclosureStatus = async () => {
    try {
      const hasAccepted = await getImageDisclosure();
      setHasAcceptedDisclosure(!!hasAccepted);
    } catch (error) {
      console.error("Error checking disclosure status:", error);
    }
  };

  const handleDisclosureAccept = async () => {
    try {
      await setImageDisclosure();
      setHasAcceptedDisclosure(true);
      setShowDisclosure(false);
      pickImage();
    } catch (error) {
      console.error("Error saving disclosure status:", error);
    }
  };

  const handleDisclosureDecline = () => {
    setShowDisclosure(false);
    toast.show(
      "Profile picture upload requires acceptance of data collection notice",
    );
  };

  const initiateImagePick = () => {
    if (hasAcceptedDisclosure) {
      pickImage();
    } else {
      setShowDisclosure(true);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant access to your photo library to update your profile picture.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        const { base64, uri } = result.assets[0];

        if (!base64) {
          throw new Error("Failed to get image data");
        }

        setIsUploading(true);
        try {
          const imageFile = {
            uri: uri,
            type: "image/jpeg",
            name: "profile-image.jpg",
          };

          await savePicture({
            artwork: imageFile,
          });
          toast.show("Picture updated successfully");
          await setTimeout(refreshWithKey, 1000);
        } catch (error) {
          console.error("Failed to upload image:", error);
          Alert.alert(
            "Error",
            error instanceof Error
              ? error.message
              : "Failed to update profile picture. Please try again.",
          );
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Error",
        "Failed to access image picker. Please check your permissions.",
      );
    }
  };

  return (
    <View style={styles.imagePickerContainer}>
      <TouchableOpacity
        onPress={initiateImagePick}
        disabled={isUploading}
        style={styles.imageContainer}
      >
        {currentImage ? (
          <Image
            source={{ uri: currentImage }}
            style={styles.profileImage}
            key={imageKey}
          />
        ) : (
          <LoggedInUserAvatar size={100} />
        )}

        <View style={styles.editOverlay}>
          <AntDesign name="camera" size={24} color="white" />
        </View>
      </TouchableOpacity>

      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color={brandColors.pink.DEFAULT} />
          <Text style={styles.uploadingText}>Updating picture...</Text>
        </View>
      )}

      <Modal
        visible={showDisclosure}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisclosure(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profile Picture Upload</Text>
            <Text style={styles.modalText}>
              This app collects and stores your profile picture image to enable
              profile customization. When you upload a profile picture, the
              image will be stored on our secure servers.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleDisclosureDecline}
              >
                <Text style={styles.buttonTextSecondary}>Not Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleDisclosureAccept}
              >
                <Text style={styles.buttonTextPrimary}>
                  I Understand and Accept
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... existing styles ...
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: brandColors.black.DEFAULT,
  },
  modalText: {
    fontSize: 16,
    color: brandColors.black.DEFAULT,
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonPrimary: {
    backgroundColor: brandColors.pink.DEFAULT,
  },
  buttonSecondary: {
    backgroundColor: "#f1f1f1",
  },
  buttonTextPrimary: {
    color: "white",
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: "#666",
    fontWeight: "600",
  },
  imagePickerContainer: {
    position: "relative",
    width: 100,
    height: 100,
    marginVertical: 16,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    overflow: "hidden",
    position: "relative",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  editOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  uploadingText: {
    color: "white",
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
  },
});
