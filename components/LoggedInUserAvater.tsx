import { useAuth, useNostrProfileEvent } from "@/hooks";
import { Avatar } from "./Avatar";

export const LoggedInUserAvater = ({ size }: { size: number }) => {
  const { pubkey } = useAuth();
  const { data: profile } = useNostrProfileEvent(pubkey);
  const imageUrl = profile?.picture ?? profile?.image;

  return <Avatar size={size} imageUrl={imageUrl} />;
};
