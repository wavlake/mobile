import Toast, { ToastOptions } from "react-native-root-toast";
import { useTheme } from "@react-navigation/native";

export const useToast = () => {
  const { colors } = useTheme();
  const show = (message: string, options?: ToastOptions) => {
    Toast.show(message, {
      backgroundColor: colors.text,
      textColor: colors.background,
      ...options,
    });
  };

  return { show };
};
