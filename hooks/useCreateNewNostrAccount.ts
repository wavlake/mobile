import {
  decodeNsec,
  encodeNsec,
  generatePrivateKey,
  getPublicKey,
  NostrUserProfile,
} from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useSaveNostrProfile } from "@/hooks/nostrProfile";
import { useSaveNostrRelayList } from "@/hooks/nostrRelayList/useSaveNostrRelayList";

export const useCreateNewNostrAccount = () => {
  const toast = useToast();
  const { login } = useAuth();
  const { save: saveProfile } = useSaveNostrProfile();
  const { save: saveRelayList } = useSaveNostrRelayList();

  return async (profile: NostrUserProfile, nsec?: string) => {
    const seckey = nsec ?? generatePrivateKey();
    const success = await login(seckey);
    const secretKey = seckey.startsWith("nsec")
      ? decodeNsec(seckey)
      : decodeNsec(encodeNsec(seckey) ?? "");

    if (!secretKey) {
      toast.show("Something went wrong. Please try again later.");
      return {
        nsec: undefined,
        pubkey: undefined,
      };
    }

    const pubkey = getPublicKey(secretKey);
    const bootstrapRelays = [
      "wss://purplepag.es",
      "wss://relay.nostr.band",
      "wss://relay.damus.io",
      "wss://relay.wavlake.com",
    ];

    if (!success) {
      toast.show("Something went wrong. Please try again later.");
      return {
        nsec: undefined,
        pubkey: undefined,
      };
    }

    await Promise.allSettled([
      saveRelayList(pubkey, bootstrapRelays),
      saveProfile(pubkey, profile),
    ]);

    return { nsec: seckey, pubkey };
  };
};
