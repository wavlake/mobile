export const usePubkeyActivityQueryKey = (pubkey?: string | null) => {
  return ["pubkeyActivity", pubkey];
};
