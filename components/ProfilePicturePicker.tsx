import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { View, ActivityIndicator, Image, StyleSheet } from "react-native";
import { Text } from "./shared/Text";
import { LoggedInUserAvatar } from "./LoggedInUserAvatar";
import AntDesign from "@expo/vector-icons/AntDesign";
import { brandColors } from "@/constants";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { useEditUser, useToast, useUser } from "@/hooks";

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
          // Create image object for FormData
          const imageFile = {
            uri: uri,
            type: "image/jpeg",
            name: "profile-image.jpg",
          };

          await savePicture({
            artwork: imageFile,
          });
          // we need a setTimeout here to ensure the image cache is invalidated
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
        onPress={pickImage}
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
    </View>
  );
};

const styles = StyleSheet.create({
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
