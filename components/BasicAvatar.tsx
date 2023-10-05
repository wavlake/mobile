import { Avatar } from "@rneui/themed";
import { brandColors } from "@/constants";

interface BasicAvatarProps {
  uri?: string;
  size?: number;
}

/**
 * This component does not support animated webp images. Use the `Avatar` component instead if you need that.
 */
export const BasicAvatar = ({ uri, size = 32 }: BasicAvatarProps) => {
  return uri ? (
    <Avatar size={size} rounded source={{ uri }} />
  ) : (
    <Avatar
      size={size}
      rounded
      icon={{ name: "user", type: "font-awesome" }}
      containerStyle={{
        backgroundColor: brandColors.purple.DEFAULT,
      }}
    />
  );
};
