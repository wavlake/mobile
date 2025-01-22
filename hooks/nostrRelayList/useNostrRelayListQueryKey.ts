export const useNostrRelayListQueryKey = (pubkey: string) => {
  return ["nostrRelayListEvent", pubkey];
};
