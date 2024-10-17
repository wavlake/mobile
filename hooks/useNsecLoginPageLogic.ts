import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  DEFAULT_CONNECTION_SETTINGS,
  useAuth,
  useAutoConnectNWC,
  useNostrProfileEvent,
} from "@/hooks";
import { useUser } from "@/components/UserContextProvider";
import {
  encodeNsec,
  generateSecretKey,
  getKeysFromNostrSecret,
  getSeckey,
  useAddPubkeyToUser,
} from "@/utils";
import { bytesToHex } from "@noble/hashes/utils";
import DeviceInfo from "react-native-device-info";

type NsecPageParams = {
  createdRandomNpub: "true" | "false";
  userAssociatedPubkey: string;
  nostrOnlyLogin: "true" | "false";
};

export const useNsecLoginPageLogic = () => {
  const {
    createdRandomNpub: createdNpubString,
    userAssociatedPubkey,
    nostrOnlyLogin: nostrOnlyLoginString,
  } = useLocalSearchParams<NsecPageParams>();
  const createdRandomNpub = createdNpubString === "true";
  const nostrOnlyLogin = nostrOnlyLoginString === "true";
  const [nsec, setNsec] = useState("");
  const [isGeneratedNsec, setIsGeneratedNsec] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const router = useRouter();
  const { login } = useAuth();
  const { user, catalogUser } = useUser();
  const { mutateAsync: addPubkeyToAccount } = useAddPubkeyToUser({});
  const { connectWallet } = useAutoConnectNWC();
  const { pubkey: nsecInputPubkey } = getKeysFromNostrSecret(nsec) || {};

  const { data: nsecInputMetadata, isFetching: nsecInputMetadataLoading } =
    useNostrProfileEvent(nsecInputPubkey, false);
  const { data: assoicatedMetadata, isFetching: associatedMetadataLoading } =
    useNostrProfileEvent(userAssociatedPubkey, false);

  const createRandomNsec = useCallback(() => {
    const privateKey = bytesToHex(generateSecretKey());
    setNsec(encodeNsec(privateKey) ?? "");
    setIsGeneratedNsec(true);
  }, []);

  const handleNsecSubmit = useCallback(async () => {
    const savedSecKey = await getSeckey();
    const savedNsec = encodeNsec(savedSecKey ?? "");
    if (savedNsec === nsec) {
      router.replace("/");
      return;
    }

    setIsLoggingIn(true);

    if (
      Boolean(userAssociatedPubkey) &&
      userAssociatedPubkey !== nsecInputPubkey
    ) {
      showMismatchAlert();
      return;
    }

    await performLogin();
  }, [
    nsec,
    userAssociatedPubkey,
    nsecInputPubkey,
    router,
    login,
    user,
    addPubkeyToAccount,
    nostrOnlyLogin,
  ]);

  const showMismatchAlert = () => {
    Alert.alert(
      "Nsec Mismatch",
      "This nsec does not match the one associated with your account. Are you sure you want to continue? You won't be able to access any previous library contents.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setIsLoggingIn(false),
        },
        {
          text: "Continue",
          style: "destructive",
          onPress: performLogin,
        },
      ],
    );
  };

  const performLogin = async () => {
    const success = await login(nsec);
    if (!success) {
      setErrorMessage("Invalid nostr nsec");
      setIsLoggingIn(false);
      return;
    }

    if (user) {
      await addPubkeyToAccount();
      if (user.emailVerified && catalogUser?.isRegionVerified) {
        await connectWallet(
          {
            ...DEFAULT_CONNECTION_SETTINGS,
            connectionName: DeviceInfo.getModel(),
          },
          nsecInputPubkey,
        );
      }
    }
    router.replace({
      pathname: "auth/welcome",
      params: {
        nostrOnlyLogin: nostrOnlyLogin ? "true" : "false",
      },
    });
    setIsLoggingIn(false);
  };

  return {
    createdRandomNpub,
    userAssociatedPubkey,
    nsec,
    setNsec,
    isGeneratedNsec,
    setIsGeneratedNsec,
    errorMessage,
    setErrorMessage,
    isLoggingIn,
    nsecInputPubkey,
    nsecInputMetadata,
    nsecInputMetadataLoading,
    assoicatedMetadata,
    associatedMetadataLoading,
    createRandomNsec,
    handleNsecSubmit,
  };
};
