import Toast, { ToastOptions } from "react-native-root-toast";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";

export const useToast = () => {
  const { colors } = useTheme();
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const show = (message: string, options?: ToastOptions) => {
    const handle = Toast.show(message, {
      backgroundColor: colors.text,
      textColor: colors.background,
      ...options,
    });
    setToasts([...toasts, handle]);
  };

  const clearAll = () => {
    toasts.map((toast) => Toast.hide(toast));
  };

  return { show, clearAll };
};
