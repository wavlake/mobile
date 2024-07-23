import { Avatar } from "@rneui/themed";
import { brandColors } from "@/constants";
import { useRouter } from "expo-router";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";

interface BasicAvatarProps {
  uri?: string | null;
  size?: number;
  pubkey?: string;
}

export const BasicAvatar = ({ uri, size = 32, pubkey }: BasicAvatarProps) => {
  const router = useRouter();
  const basePathname = useGetBasePathname();
  const onPress = () => {
    if (pubkey) {
      router.push({
        pathname: `${basePathname}/profile/${pubkey}`,
        params: { includeBackButton: "true" },
      });
    }
  };

  if (!uri) {
    return (
      <Avatar
        size={size}
        rounded
        icon={{ name: "user", type: "font-awesome" }}
        containerStyle={{
          backgroundColor: brandColors.purple.DEFAULT,
        }}
        onPress={onPress}
      />
    );
  }

  return (
    <Avatar
      size={size}
      rounded
      {...(uri ? { source: { uri } } : {})}
      onPress={onPress}
    />
  );
};
