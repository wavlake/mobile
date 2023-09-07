import { Avatar as BaseAvatar } from "@rneui/themed";
import { Image } from "expo-image";
import { useAuth, useNostrProfile } from "@/hooks";

// just using a sample blurhash to resemble a loading state
const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

interface AvatarProps {
  size: number;
}

export const Avatar = ({ size }: AvatarProps) => {
  const { pubkey } = useAuth();
  const { avatarUrl } = useNostrProfile(pubkey) ?? {};

  return (
    <>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          placeholder={blurhash}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <BaseAvatar
          size={size}
          rounded
          icon={{ name: "user", type: "font-awesome" }}
          containerStyle={{ backgroundColor: "#696969" }}
        />
      )}
    </>
  );
};
