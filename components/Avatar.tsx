import { Avatar as BaseAvatar } from "@rneui/themed";
import { Image } from "expo-image";
import { brandColors } from "@/constants";

// just using a sample blurhash to resemble a loading state
const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

interface AvatarProps {
  size: number;
  imageUrl?: string | null;
  name?: string | null;
}

export const Avatar = ({ size, imageUrl, name }: AvatarProps) => {
  const initial = name?.[0] ?? "";

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
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
