import { useState } from "react";
import { useAuth } from "@/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { PressableIcon } from "../PressableIcon";
import { OverflowMenuDialog, OverflowMenuProps } from "./OverflowMenuDialog";
import { ContentType } from "../ActivityItemRow";

export const OverflowMenu = ({
  size = 24,
  color,
  contentType,
  contentId,
  ...dialogProps
}: Omit<OverflowMenuProps, "isOpen" | "setIsOpen"> & {
  contentType: ContentType;
  contentId: string;
  size?: number;
  color?: string;
}) => {
  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (!pubkey) return null;
  return (
    <>
      <PressableIcon onPress={() => setIsOpen(true)}>
        <Ionicons
          name="ellipsis-horizontal-sharp"
          size={size}
          color={color ?? colors.text}
        />
      </PressableIcon>
      <OverflowMenuDialog
        {...dialogProps}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        contentType={contentType}
        contentId={contentId}
      />
    </>
  );
};
