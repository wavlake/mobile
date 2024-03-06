import { Dimensions, Pressable, View } from "react-native";
import { Dialog } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/hooks";
import { useState, SetStateAction } from "react";
import { brandColors } from "@/constants";

import { Text } from "@/components/Text";

interface ChoosePlaylistButtonProps {
  contentId: string;
  setPrevDialogOpen: (value: SetStateAction<boolean>) => void;
}

export const ChoosePlaylistButton = ({
  contentId,
  setPrevDialogOpen,
}: ChoosePlaylistButtonProps) => {
  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePress = () => {
    setIsDialogOpen(true);
  };

  if (!pubkey) return;
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Pressable onPress={() => handlePress()}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
              }}
              numberOfLines={1}
              bold
            >
              Add to existing playlist
            </Text>
          </View>
          <MaterialCommunityIcons
            name={"plus-thick"}
            size={24}
            color={colors.text}
          />
        </View>
      </Pressable>
      <Dialog
        isVisible={isDialogOpen}
        onBackdropPress={() => setIsDialogOpen(false)}
        overlayStyle={{
          backgroundColor: colors.background,
          width: screenWidth - 32,
          paddingVertical: 32,
        }}
        backdropStyle={{
          backgroundColor: brandColors.black.light,
          opacity: 0.8,
        }}
      >
        <View style={{ gap: 32 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                }}
                numberOfLines={1}
                bold
              >
                Select playlist
              </Text>
            </View>
          </View>
        </View>
      </Dialog>
    </View>
  );
};
