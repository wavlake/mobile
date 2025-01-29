import { generateSecretKey, getPublicKey } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useAddFollow, useSaveNostrProfile } from "@/hooks/nostrProfile";
import { useSaveNostrRelayList } from "@/hooks/nostrRelayList/useSaveNostrRelayList";
import { nip19 } from "nostr-tools";
import { NostrUserProfile } from "@/utils/types";
import { DEFAULT_WRITE_RELAY_URIS } from "@/utils/shared";

export const useCreateNewNostrAccount = () => {
  const toast = useToast();
  const { login } = useAuth();
  const { save: saveProfile } = useSaveNostrProfile();
  const { save: saveRelayList } = useSaveNostrRelayList();
  const { mutateAsync: addFollow } = useAddFollow();

  return async (profile: NostrUserProfile, customNsec?: string) => {
    const nsec = customNsec ?? nip19.nsecEncode(generateSecretKey());
    const success = await login(nsec);

    if (!nsec) {
      toast.show("Something went wrong. Please try again later.");
      return {
        nsec: undefined,
        pubkey: undefined,
      };
    }

    let { data } = nip19.decode(nsec);
    const pubkey = getPublicKey(data as Uint8Array);

    if (!success) {
      toast.show("Something went wrong. Please try again later.");
      return {
        nsec: undefined,
        pubkey: undefined,
      };
    }

    try {
      await Promise.all([
        saveProfile(profile),
        saveRelayList(DEFAULT_WRITE_RELAY_URIS),
        addFollow(undefined),
      ]);
    } catch (error) {
      console.error("Error saving relay list or profile:", error);
    }

    return { nsec, pubkey };
  };
};
