import { Avatar } from "@rneui/themed";
import { brandColors } from "@/constants";
import { useRouter } from "expo-router";

interface BasicAvatarProps {
  uri?: string | null;
  size?: number;
  pubkey?: string;
}

export const BasicAvatar = ({ uri, size = 32, pubkey }: BasicAvatarProps) => {
  const router = useRouter();
  return uri ? (
    <Avatar
      size={size}
      rounded
      source={{ uri }}
      onPress={
        pubkey
          ? () =>
              router.push({
                pathname: `/pulse/profile/${pubkey}`,
                params: { includeBackButton: "true" },
              })
          : undefined
      }
    />
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
