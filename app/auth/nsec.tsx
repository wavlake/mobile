import { Text, Button, TextInput, Avatar } from "@/components";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth, useLookupNostrProfile } from "@/hooks";
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
import { DialogWrapper } from "@/components/DialogWrapper";
import { useCatalogPubkey } from "@/hooks/nostrProfile/useCatalogPubkey";

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
  const { user } = useUser();
  const { mutateAsync: addPubkeyToAccount } = useAddPubkeyToUser({});
  const { colors } = useTheme();
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [hideSecureText, setHideSecureText] = useState(true);
  const { npub, pubkey } = getNpubFromNsec(nsec);

  const createRandomNsec = () => {
    const privateKey = generatePrivateKey();
    setNsec(encodeNsec(privateKey) ?? "");
    setIsGeneratedNsec(true);
  };

  // If we generated a new random nsec, dont bother fetching the profile since it's not created yet
  const { data: profileEvent, isLoading } = useCatalogPubkey(
    isGeneratedNsec ? null : pubkey,
  );
  const profileMetadata = profileEvent?.metadata;
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

  const handleNsecSubmit = async () => {
    const savedSecKey = await getSeckey();
    const savedNsec = encodeNsec(savedSecKey ?? "");
    if (savedNsec === nsec) {
      // if the user is trying to log in with the same nsec, just log in
      router.replace("/");
      return;
    }

    setIsLoggingIn(true);

    // log in with the nsec on the form
    const success = await login(nsec);
    if (!success) {
      setErrorMessage("Invalid nostr nsec");
      setIsLoggingIn(false);
      return;
    }

    // if the user is logged into firebase
    if (user) {
      // add the new pubkey to user_pubkey table
      // this will delete the old associated pubkey from user_pubkey
      await addPubkeyToAccount();
    }

    // add an artifical delay to allow time to fetch profile if it's not cached
    setTimeout(async () => {
      router.replace("/");
      setIsLoggingIn(false);
    }, 1000);
  };
  const NPUB_AVATAR_SIZE = 40;
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
        <TouchableOpacity onPress={() => setIsInfoDialogOpen(true)}>
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
            <Text>What's an nsec?</Text>
            <Ionicons
              name="help-circle-outline"
              size={30}
              color={colors.text}
            />
          </View>
        </TouchableOpacity>
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
                setIsGeneratedNsec(false);
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
              }}
            >
              {npub && (
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text,
                  }}
                >
                  {npub.slice(0, 10)}...
                  {npub.slice(npub.length - 7, npub.length)}
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
                {pubkey && isLoading ? (
                  <>
                    <ActivityIndicator
                      animating={true}
                      size={NPUB_AVATAR_SIZE}
                    />
                    <Text>Searching for profile...</Text>
                  </>
                ) : (
                  <>
                    {profileMetadata?.picture && (
                      <Avatar
                        size={NPUB_AVATAR_SIZE}
                        imageUrl={profileMetadata.picture}
                      />
                    )}
                    {profileMetadata?.name && (
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.text,
                        }}
                      >
                        {profileMetadata.name}
                      </Text>
                    )}
                  </>
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
          <Button color="lightgray" onPress={() => router.back()}>
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
            A Nostr private key (nsec) has been generated for you and is stored
            securely on this device. Your nsec is a secret and should never be
            shared with anyone.
            {"\n"}
            {"\n"}
            Alternatively, you can enter your own private key to use if you have
            one.
            {"\n"}
            {"\n"}
            Your private key will only be stored on your device and not on
            Wavlake systems. Wavlake will never have access to your key.
          </Text>
        </View>
        <InfoDialog isOpen={isInfoDialogOpen} setIsOpen={setIsInfoDialogOpen} />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

export const InfoDialog = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) => {
  return (
    <DialogWrapper isOpen={isOpen} setIsOpen={setIsOpen}>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <Text bold style={{ fontSize: 18 }}>
          What is a Nostr private key (nsec)?
        </Text>
        <Text style={{ fontSize: 18 }}>
          Nostr is a way for people to communicate online using a universal
          public identity, kind of like an email address. A nsec is a private
          key used to sign messages on Nostr.
        </Text>
        <Text style={{ fontSize: 18 }}>
          You can access your private key from your profile page and back it up
          later if you are unable to back it up securely right now. Just keep in
          mind that Wavlake does not have access to your private key, so if log
          out of Wavlake without backing up your nsec first, you will lose your
          Nostr identity. Your Wavlake account will remain intact.
        </Text>

        <Button
          style={{
            alignSelf: "center",
          }}
          onPress={() => setIsOpen(false)}
        >
          OK
        </Button>
      </View>
    </DialogWrapper>
  );
};
