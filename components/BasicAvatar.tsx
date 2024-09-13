import { Avatar } from "@rneui/themed";
import { brandColors } from "@/constants";
import { useRouter } from "expo-router";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { NostrUserProfile } from "@/utils";
import { Pressable } from "react-native";
import { PulsatingBasicAvatar } from "./PulsatingBasicAvatar";

interface BasicAvatarProps {
  uri?: string | null;
  size?: number;
  pubkey?: string;
  npubMetadata?: NostrUserProfile | null;
  isLoading?: boolean;
}

export const BasicAvatar = ({
  uri,
  size = 32,
  pubkey,
  npubMetadata,
  isLoading,
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

  return isLoading ? (
    <Pressable onPress={onPress}>
      <PulsatingBasicAvatar />
    </Pressable>
  ) : uri ? (
    <Avatar
      size={size}
      rounded
      source={{ uri }}
      containerStyle={{
        backgroundColor: brandColors.purple.DEFAULT,
      }}
      onPress={onPress}
    />
  ) : (
    <Avatar
      size={size}
      rounded
      icon={{
        name: "user",
        type: "font-awesome",
      }}
      containerStyle={{
        backgroundColor: brandColors.purple.DEFAULT,
      }}
      onPress={onPress}
    />
  );
};
