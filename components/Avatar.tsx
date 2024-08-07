import { Avatar as BaseAvatar } from "@rneui/themed";
import { Image } from "expo-image";
import { useNostrProfile } from "@/hooks";
import { brandColors } from "@/constants";

// just using a sample blurhash to resemble a loading state
const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

interface AvatarProps {
  size: number;
  imageUrl?: string | null;
}

export const Avatar = ({ size, imageUrl }: AvatarProps) => {
  const profile = useNostrProfile();

  // use provided imageUrl if available, else use profile picture
  // this is used on the account creation page before the user has a profile event created
  // some legacy user avatars were created using an "image" instead of "picture"
  const avatarUrl = imageUrl ?? profile?.picture ?? profile?.image;
  const initial = profile?.name?.[0] ?? "";

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        placeholder={blurhash}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        cachePolicy="memory-disk"
      />
    );
  }

  if (initial) {
    return (
      <BaseAvatar
        size={size}
        rounded
        title={initial}
        containerStyle={{ backgroundColor: brandColors.purple.DEFAULT }}
      />
    );
  }

  return (
    <BaseAvatar
      size={size}
      rounded
      icon={{
        name: "user",
        type: "font-awesome",
      }}
      containerStyle={{ backgroundColor: brandColors.purple.DEFAULT }}
    />
  );
};
