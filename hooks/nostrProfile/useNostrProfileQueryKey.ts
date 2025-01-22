export const useNostrProfileQueryKey = (pubkey: string) => {
  return ["nostrProfileEvent", pubkey];
};
