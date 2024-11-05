import { useAuth, useNostrProfileEvent, useUser } from "@/hooks";
import { Avatar } from "./Avatar";

export const LoggedInUserAvatar = ({ size }: { size: number }) => {
  const { pubkey } = useAuth();
  const { catalogUser } = useUser();
  const { data: profile } = useNostrProfileEvent(pubkey);
  const imageUrl =
    profile?.picture ?? profile?.image ?? catalogUser?.artworkUrl;

  return <Avatar size={size} imageUrl={imageUrl} />;
};
