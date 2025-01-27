import { useNostrEvents } from "@/providers/NostrEventProvider";

export function useNostrInitialLoad(pubkey?: string | null) {
  const { useInitialLoad } = useNostrEvents();
  return useInitialLoad(pubkey);
}
