import React, { useState } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Text, Button, TextInput, NsecInfoDialog } from "@/components";
import { CopyButton } from "@/components/CopyButton";
import { BasicAvatar } from "@/components/BasicAvatar";
import { useNsecLoginPageLogic } from "@/hooks";
import { encodeNpub, NostrUserProfile } from "@/utils";
import { useRouter } from "expo-router";

const NsecInput: React.FC<{
  nsec: string;
  setNsec: (nsec: string) => void;
  errorMessage: string;
  setErrorMessage: (errorMessage: string) => void;
  setIsGeneratedNsec: (isGeneratedNsec: boolean) => void;
}> = ({ nsec, setNsec, errorMessage, setErrorMessage, setIsGeneratedNsec }) => {
  const [hideSecureText, setHideSecureText] = useState(true);

  return (
    <TextInput
      label="nsec"
      secureTextEntry={hideSecureText}
      onFocus={() => setHideSecureText(false)}
      onBlur={() => setHideSecureText(true)}
      autoCorrect={false}
      value={nsec}
      onChangeText={(value) => {
        setNsec(value);
        setErrorMessage("");
        setIsGeneratedNsec(false);
      }}
      errorMessage={errorMessage}
      rightIcon={<CopyButton value={nsec} />}
    />
  );
};

const NsecInputMetadata: React.FC<{
  isLoading: boolean;
  isGeneratedNsec: boolean;
  profileMetadata: NostrUserProfile | null | undefined;
  nsecInputPubkey?: string | null;
}> = ({ isLoading, isGeneratedNsec, profileMetadata, nsecInputPubkey }) => {
  const NPUB_AVATAR_SIZE = 40;
  if (isGeneratedNsec || !nsecInputPubkey)
    return <View style={styles.nsecInputMetadata} />;

  if (isLoading) {
    return (
      <View style={styles.nsecInputMetadata}>
        <View style={styles.profileInfo}>
          <ActivityIndicator animating={true} size={NPUB_AVATAR_SIZE} />
          <Text>Searching for profile...</Text>
        </View>
      </View>
    );
  }

  const npub = profileMetadata?.pubkey
    ? encodeNpub(profileMetadata.pubkey)
    : undefined;

  return (
    <View style={styles.nsecInputMetadata}>
      <View style={styles.profileInfo}>
        <BasicAvatar
          uri={profileMetadata?.picture}
          pubkey={profileMetadata?.publicHex}
          npubMetadata={profileMetadata}
          isLoading={isLoading}
        />
        <View style={styles.profileInfoText}>
          <ProfileInfoRow
            label="name"
            value={profileMetadata?.name ?? "Profile not found"}
          />
          <ProfileInfoRow label="npub" value={npub ?? ""} />
        </View>
      </View>
    </View>
  );
};

const ProfileInfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.profileInfoRow}>
    <Text style={styles.profileInfoLabel} bold>
      {label}:
    </Text>
    <Text
      style={styles.profileInfoValue}
      ellipsizeMode="tail"
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

const AssociatedAccountInfo: React.FC<{
  userAssociatedPubkey: string;
  useAssoicatedPubkeyMetadata: NostrUserProfile | null | undefined;
  isLoading: boolean;
}> = ({ userAssociatedPubkey, useAssoicatedPubkeyMetadata, isLoading }) => {
  const npub = encodeNpub(userAssociatedPubkey);

  return (
    <>
      <Text style={styles.associatedAccountInfo}>
        There is a Nostr key already associated with this account. Please enter
        your key (nsec) below to continue using your public identity and
        history.
      </Text>
      <Text style={styles.associatedAccountSubInfo}>
        Most recently associated Nostr Profile
      </Text>
      <View style={styles.associatedAccountProfile}>
        <BasicAvatar
          uri={useAssoicatedPubkeyMetadata?.picture}
          pubkey={useAssoicatedPubkeyMetadata?.publicHex}
          npubMetadata={useAssoicatedPubkeyMetadata}
          isLoading={isLoading}
        />
        <View style={styles.profileInfoText}>
          <ProfileInfoRow
            label="name"
            value={useAssoicatedPubkeyMetadata?.name ?? "Profile not found"}
          />
          <ProfileInfoRow label="npub" value={npub ?? ""} />
        </View>
      </View>
      <Text style={styles.associatedAccountInfo}>
        If you don't have a key, that's OK. You can generate a brand new key to
        use by tapping the Random key button below.
      </Text>
    </>
  );
};

const RandomNpubInfo: React.FC = () => (
  <Text style={styles.randomNpubInfo}>
    A Nostr private key (nsec) has been generated for you and is stored securely
    on this device. Your nsec is a secret and should never be shared with
    anyone.
    {"\n\n"}
    Alternatively, you can enter your own private key to use if you have one.
    {"\n\n"}
    Your private key will only be stored on your device and not on Wavlake
    systems. Wavlake will never have access to your key.
  </Text>
);

// Main Component
export function NsecIntakePage() {
  const { colors } = useTheme();
  const {
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
  } = useNsecLoginPageLogic();
  const router = useRouter();

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {userAssociatedPubkey ? (
          <AssociatedAccountInfo
            useAssoicatedPubkeyMetadata={assoicatedMetadata}
            userAssociatedPubkey={userAssociatedPubkey}
            isLoading={associatedMetadataLoading}
          />
        ) : (
          <Text style={styles.associatedAccountInfo}>
            Let's set up your Nostr key, which creates a secure, public identity
            for your activity.
          </Text>
        )}
        <NsecInfoDialog />
        <View style={styles.content}>
          <NsecInput
            nsec={nsec}
            setNsec={setNsec}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            setIsGeneratedNsec={setIsGeneratedNsec}
          />
          <TouchableOpacity
            onPress={createRandomNsec}
            style={styles.randomKeyButton}
          >
            <Text>Random key</Text>
            <Ionicons name="dice-outline" size={30} color={colors.text} />
          </TouchableOpacity>
          {/* <NsecInputMetadata
            isLoading={nsecInputMetadataLoading}
            isGeneratedNsec={isGeneratedNsec}
            nsecInputPubkey={nsecInputPubkey}
            profileMetadata={nsecInputMetadata}
          /> */}
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
          {/* {isGeneratedNsec && <RandomNpubInfo />} */}
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexDirection: "column",
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "100%",
  },
  content: {
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },
  nsecInputMetadata: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
    height: 60,
    marginTop: -18,
    width: "100%",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  profileInfoText: {
    flexDirection: "column",
    flexGrow: 1,
  },
  profileInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileInfoLabel: {
    width: 54,
  },
  profileInfoValue: {
    flex: 1,
    fontSize: 14,
  },
  randomKeyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  associatedAccountInfo: {
    fontSize: 18,
    marginBottom: 10,
  },
  associatedAccountSubInfo: {
    fontSize: 14,
    marginBottom: 10,
  },
  associatedAccountProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  randomNpubInfo: {
    fontSize: 18,
  },
});
