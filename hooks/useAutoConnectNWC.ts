import { useAuth, useSettingsManager, useToast } from "@/hooks";
import { useUser } from "@/components";
import {
  generateSecretKey,
  getPublicKey,
  intakeNwcURI,
  useCreateConnection,
  buildUri,
  walletServicePubkey,
  WalletConnectionMethods,
} from "@/utils";
import { bytesToHex } from "@noble/hashes/utils";
import { useWalletBalance } from "./useWalletBalance";

interface ConnectionSettings {
  connectionName: string;
  msatBudget: number;
  maxMsatPaymentAmount: number;
  requestMethods: WalletConnectionMethods[];
}

export const DEFAULT_CONNECTION_SETTINGS: Omit<
  ConnectionSettings,
  "connectionName"
> = {
  msatBudget: 210000000,
  maxMsatPaymentAmount: 21000000,
  requestMethods: ["get_balance", "pay_invoice"],
};

// this hook auto connects the wavlake wallet to the app using NWC
export const useAutoConnectNWC = () => {
  const { catalogUser } = useUser();
  const { pubkey: userPubkey } = useAuth();
  const toast = useToast();
  const { mutate: createConnection } = useCreateConnection();
  const { refetch: refetchSettings } = useSettingsManager();
  const { refetch: fetchBalance } = useWalletBalance();

  const connectWallet = async (
    settings: ConnectionSettings,
    // optional userPubkey to use for the NWC connection
    // to be used during login, when useAuth() is not up to date
    overrideUserPubkey?: string | null,
  ) => {
    const { connectionName, msatBudget, maxMsatPaymentAmount, requestMethods } =
      settings;

    const pk = generateSecretKey();
    const connectionPubkey = getPublicKey(pk);

    // Create the connection in the db
    await createConnection({
      name: connectionName,
      msatBudget,
      pubkey: connectionPubkey,
      maxMsatPaymentAmount,
      requestMethods,
    });

    // Add the connection to the mobile app
    const relay = "wss://relay.wavlake.com";
    const nwcUri = buildUri(`nostr+walletconnect://${walletServicePubkey}`, {
      relay: relay,
      secret: bytesToHex(pk),
      lud16: catalogUser?.profileUrl
        ? `${catalogUser.profileUrl}@wavlake.com`
        : undefined,
    });

    const { isSuccess, error, fetchInfo } = await intakeNwcURI({
      uri: nwcUri,
      userIdOrPubkey: overrideUserPubkey || catalogUser?.id || userPubkey,
    });

    if (isSuccess) {
      // Fetch the info event and refresh settings
      await fetchInfo?.();
      await refetchSettings();
      fetchBalance();
      return { success: true };
    } else {
      error && toast.show(error);
      return { success: false };
    }
  };

  return { connectWallet };
};
