import { Button, ButtonProps } from "./shared/Button";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";

interface CancelButtonProps extends ButtonProps {
  onCancel?: () => void;
}

export const CancelButton = ({ onCancel, ...rest }: CancelButtonProps) => {
  const { colors } = useTheme();
  const router = useRouter();
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <Button
      color={colors.border}
      titleStyle={{ color: colors.text }}
      onPress={handleCancel}
      {...rest}
    >
      Cancel
    </Button>
  );
};
