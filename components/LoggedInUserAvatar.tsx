import { useAuth, useNostrProfile, useUser } from "@/hooks";
import { Avatar } from "./Avatar";

export const LoggedInUserAvatar = ({ size }: { size: number }) => {
  const { pubkey } = useAuth();
  const { catalogUser } = useUser();
  const { data: event, decodeProfileMetadata } = useNostrProfile(pubkey);
  const profile = decodeProfileMetadata(event);
  const imageUrl =
    profile?.picture ?? profile?.image ?? catalogUser?.artworkUrl;

  return <Avatar size={size} imageUrl={imageUrl} />;
};
