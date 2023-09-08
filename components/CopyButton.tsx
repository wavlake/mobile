import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useToast } from "@/hooks";

interface CopyButtonProps {
  value: string;
}

export const CopyButton = ({ value }: CopyButtonProps) => {
  const toast = useToast();
  const { colors } = useTheme();
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(value);
      toast.show("Copied to clipboard");
    } catch {
      toast.show("Failed to copy to clipboard");
    }
  };

  return (
    <TouchableOpacity onPress={copyToClipboard}>
      <Ionicons name="copy" size={24} color={colors.text} />
    </TouchableOpacity>
  );
};
