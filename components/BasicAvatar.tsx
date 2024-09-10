import { Avatar } from "@rneui/themed";
import { brandColors } from "@/constants";
import { useRouter } from "expo-router";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { NostrUserProfile } from "@/utils";

interface BasicAvatarProps {
  uri?: string | null;
  size?: number;
  pubkey?: string;
  npubMetadata?: NostrUserProfile | null;
}

export const BasicAvatar = ({
  uri,
  size = 32,
  pubkey,
  npubMetadata,
}: BasicAvatarProps) => {
  const router = useRouter();
  const basePathname = useGetBasePathname();
  const onPress = () => {
    if (pubkey) {
      router.push({
        pathname: `${basePathname}/profile/${pubkey}`,
        params: {
          includeBackButton: "true",
          headerTitle: npubMetadata?.name
            ? `${npubMetadata.name}'s Profile`
            : "Profile",
          includeHeaderTitleVerifiedBadge: "0",
        },
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
