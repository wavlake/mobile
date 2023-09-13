import { Button, ButtonProps } from "@/components/Button";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";

export const CancelButton = (props: ButtonProps) => {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <Button
      color={colors.border}
      titleStyle={{ color: colors.text }}
      onPress={() => router.back()}
      {...props}
    >
      Cancel
    </Button>
  );
};
