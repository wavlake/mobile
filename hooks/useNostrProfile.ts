import { useQuery } from "@tanstack/react-query";
import { getProfileMetadata } from "@/utils";

export const useNostrProfile = (pubkey: string | null) => {
  const { data } = useQuery({
    queryKey: ["nostrProfile", pubkey],
    queryFn: () => getProfileMetadata(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  return data
    ? { avatarUrl: data.picture, username: data.display_name || data.name }
    : null;
};
