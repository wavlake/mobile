import { Alert, Pressable } from "react-native";
import { useTheme } from "@react-navigation/native";
import { ReactNode } from "react";
import { Text } from "./shared/Text";
import { useAuth } from "@/hooks";
import { useRouter } from "expo-router";

interface PressableIconProps {
  onPress: () => void;
  text?: ReactNode;
  numberOfLines?: number;
  icon?: ReactNode;
  isLoading?: boolean;
  nostrRequired?: boolean;
}

export const PressableDialogRow = ({
  onPress,
  text,
  numberOfLines = 1,
  icon,
  isLoading = false,
  nostrRequired = false,
}: PressableIconProps) => {
  const router = useRouter();
  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const handlePress = () => {
    if (nostrRequired && !pubkey) {
      Alert.alert(
        "Nostr account required",
        "You must login to nostr to add content to your library.",
        [
          {
            text: "Login to nostr",
            onPress: () => {
              router.push("/settings");
              router.push("/settings/advanced");
              router.push("/settings/nsec");
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }
    if (!isLoading) {
      onPress?.();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 50,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: pressed ? colors.card : colors.background,
      })}
    >
      {typeof text === "string" ? (
        <Text
          style={{
            fontSize: 20,
          }}
          numberOfLines={numberOfLines}
          bold
        >
          {text}
        </Text>
      ) : (
        text
      )}
      {icon}
    </Pressable>
  );
};
