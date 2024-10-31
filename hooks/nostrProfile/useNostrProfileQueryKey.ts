import { useNostrRelayList } from "@/hooks/nostrRelayList";

export const useNostrProfileQueryKey = (pubkey: string) => {
  const { readRelayList } = useNostrRelayList();

  return ["nostrProfileEvent", pubkey, readRelayList];
};
