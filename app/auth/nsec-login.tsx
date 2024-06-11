import { Text, Button, TextInput, Avatar, Center } from "@/components";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks";
import { useRouter } from "expo-router";
import {
  decodeNsec,
  encodeNpub,
  encodeNsec,
  generatePrivateKey,
  getPublicKey,
  getSeckey,
  useAddPubkeyToUser,
} from "@/utils";
import { CopyButton } from "@/components/CopyButton";
import { useUser } from "@/components/UserContextProvider";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

const getNpubFromNsec = (nsec: string) => {
  const seckey = decodeNsec(nsec);
  if (!seckey) return { npub: null, pubkey: null };
  const pubkey = getPublicKey(seckey);
  const npub = encodeNpub(pubkey);

  return {
    npub,
    pubkey,
  };
};

export default function Login() {
  const [nsec, setNsec] = useState("");
  const [isGeneratedNsec, setIsGeneratedNsec] = useState(false);

  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const { user, signOut, catalogUser } = useUser();
  const { mutateAsync: addPubkeyToAccount } = useAddPubkeyToUser({});
  const { colors } = useTheme();
  const [hideSecureText, setHideSecureText] = useState(true);

  const createRandomNsec = () => {
    const privateKey = generatePrivateKey();
    setNsec(encodeNsec(privateKey) ?? "");
    setIsGeneratedNsec(true);
  };

  // initialize the nsec input
  useEffect(() => {
    (async () => {
      if (user) {
        const savedPrivateKey = await getSeckey();
        savedPrivateKey && setNsec(encodeNsec(savedPrivateKey) ?? "");
      } else {
        // if the user is not logged in, generate a new nsec for them
        createRandomNsec();
      }
    })();
  }, []);
  const mostRecentUserData = catalogUser?.nostrProfileData?.[0];
  const mostRecentUserNpub =
    catalogUser?.nostrProfileData?.[0]?.publicHex &&
    encodeNpub(catalogUser?.nostrProfileData?.[0]?.publicHex);

  const handleNsecSubmit = async () => {
    setIsLoggingIn(true);
    const { npub, pubkey } = getNpubFromNsec(nsec);
    if (!npub) {
      setErrorMessage("Invalid nostr nsec");
      setIsLoggingIn(false);
      return;
    }

    if (isGeneratedNsec) {
      // log in with the nsec on the form
      const success = await login(nsec);
      if (!success) {
        setErrorMessage("Invalid nostr nsec");
        setIsLoggingIn(false);
        return;
      }

      // if the nsec was generated, we need to add the pubkey to the user's account
      await addPubkeyToAccount();
    } else if (mostRecentUserNpub !== npub) {
      setErrorMessage(
        "This nsec does not match the one associated with your account",
      );
      setIsLoggingIn(false);

      return;
    } else {
      // log in with the nsec on the form
      const success = await login(nsec);
      if (!success) {
        setErrorMessage("Invalid nostr nsec");
        setIsLoggingIn(false);
        return;
      }
    }

    setTimeout(async () => {
      router.replace("/");
      setIsLoggingIn(false);
    }, 1000);
  };

  const NPUB_AVATAR_SIZE = 40;

  if (!mostRecentUserData) {
    return (
      <Center>
        <Text>Something went wrong, please login again</Text>
      </Center>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView
        style={{
          display: "flex",
          flexDirection: "column",
          paddingHorizontal: 24,
          paddingBottom: 50,
        }}
      >
        <Text style={{ fontSize: 18, marginBottom: 20 }}>
          You already have an nostr account associated with this login. Please
          enter your nsec below to continue using your associated library.
          {"\n"}
          {"\n"}
          Alternatively, you can generate a nsec by tapping the button below.
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <TextInput
              label="nsec"
              secureTextEntry={hideSecureText}
              onFocus={() => setHideSecureText(false)}
              onBlur={() => setHideSecureText(true)}
              autoCorrect={false}
              value={nsec}
              onChangeText={(value) => {
                // user is entering their own nsec
                setNsec(value);
                setErrorMessage("");
              }}
              errorMessage={errorMessage}
              rightIcon={<CopyButton value={nsec} />}
            />
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 10,
                height: 60,
                width: "100%",
                marginVertical: 25,
              }}
            >
              {mostRecentUserNpub && (
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text,
                  }}
                >
                  {mostRecentUserNpub}
                </Text>
              )}
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {mostRecentUserData.metadata.picture && (
                  <Avatar
                    size={NPUB_AVATAR_SIZE}
                    imageUrl={mostRecentUserData.metadata.picture}
                  />
                )}
                {mostRecentUserData.metadata.name && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.text,
                    }}
                  >
                    {mostRecentUserData.metadata.name}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <Button
            onPress={handleNsecSubmit}
            disabled={isLoggingIn}
            loading={isLoggingIn}
          >
            Save
          </Button>
          <Button
            color="lightgray"
            onPress={() => {
              signOut();
              router.back();
            }}
          >
            Cancel
          </Button>
          <TouchableOpacity onPress={createRandomNsec}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 10,
              }}
            >
              <Text>Random key</Text>
              <Ionicons name="dice-outline" size={30} color={colors.text} />
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: 18 }}>
            Your private key will only be stored on your device and not on
            Wavlake systems. Wavlake will never have access to your key.
          </Text>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
