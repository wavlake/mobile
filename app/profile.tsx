import { Button, Avatar, TextInput, Text } from "@/components";
import { Alert, ScrollView, View } from "react-native";
import { useState } from "react";
import {
  useAuth,
  useNostrProfile,
  useSaveNostrProfile,
  useToast,
} from "@/hooks";
import { encodeNsec, encodeNpub, getSeckey } from "@/utils";
import { CopyButton } from "@/components/CopyButton";
import { useTheme } from "@react-navigation/native";

export default function ProfilePage() {
  const { colors } = useTheme();
  const toast = useToast();
  const { pubkey = "" } = useAuth();
  const npub = encodeNpub(pubkey) ?? "";
  const profile = useNostrProfile();
  const { save, isSaving } = useSaveNostrProfile();
  const [name, setName] = useState(profile?.name ?? "");
  const isSaveDisabled =
    profile?.name === name || name.length === 0 || isSaving;
  const [nsec, setNsec] = useState("");
  const handleRevealNsec = () => {
    Alert.alert(
      "Are you sure?",
      "Revealing your private key can compromise your account's security.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          style: "destructive",
          onPress: async () => {
            const seckey = await getSeckey();
            const nsec = encodeNsec(seckey ?? "");

            if (nsec) {
              setNsec(nsec);
            }
          },
        },
      ],
    );
  };
  const handleSave = () => {
    const saveProfile = async () => {
      try {
        await save(pubkey, { name });
        toast.show("Profile saved");
      } catch {
        toast.show("Failed to save profile");
      }
    };
    if (profile) {
      return saveProfile();
    } else {
      Alert.alert(
        "Are you sure?",
        "We were unable to find your profile on Nostr relays. Continuing to save will replace your profile on Nostr relays with this one.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Continue",
            style: "destructive",
            onPress: () => {
              return saveProfile();
            },
          },
        ],
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        alignItems: "center",
        gap: 24,
        paddingBottom: 80,
      }}
    >
      <Avatar size={120} />
      <TextInput label="username" value={name} onChangeText={setName} />
      <Button onPress={handleSave} disabled={isSaveDisabled} loading={isSaving}>
        Save
      </Button>
      <View style={{ width: "100%", marginTop: 24 }}>
        <TextInput
          label="npub"
          value={npub}
          editable={false}
          rightIcon={<CopyButton value={npub} />}
        />
        <Text style={{ fontSize: 18 }}>
          Your npub is safe to share with friends and others you want to
          interact with.
        </Text>
      </View>
      {!nsec && (
        <Button
          color={colors.border}
          titleStyle={{ color: colors.text }}
          onPress={handleRevealNsec}
          width={280}
          style={{ marginTop: 24 }}
        >
          Reveal private key (nsec)
        </Button>
      )}
      {nsec && (
        <View style={{ width: "100%" }}>
          <TextInput
            label="nsec"
            value={nsec}
            editable={false}
            rightIcon={<CopyButton value={nsec} />}
          />
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: 18, color: "red" }} bold>
              CAUTION!
            </Text>
            <Text style={{ fontSize: 18 }}>
              Your private key (nsec) is stored securely on this device. Your
              nsec is a secret and should never be shared with anyone.
            </Text>
            <Text style={{ fontSize: 18 }}>
              Your nsec maintains your identify across all of Nostr, so be
              mindful where you copy and paste it. It is typically not a good
              idea to paste this into websites and other apps you are unsure
              about. Keep it safe!
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
