import { Button, Avatar, TextInput, Text } from "@/components";
import { Stack } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { useState } from "react";
import {
  useAuth,
  useNostrProfile,
  useNostrProfileMutation,
  useToast,
} from "@/hooks";
import {
  encodeNsec,
  encodeNpub,
  getSeckey,
  makeProfileEvent,
  signEvent,
} from "@/utils";
import { CopyButton } from "@/components/CopyButton";
import { brandColors } from "@/constants";

export default function ProfilePage() {
  const { pubkey } = useAuth();
  const npub = encodeNpub(pubkey ?? "") ?? "";
  const profile = useNostrProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const isSaveDisabled =
    profile?.name === name || name.length === 0 || isSaving;
  const toast = useToast();
  const [nsec, setNsec] = useState("");
  const nostrProfileMutation = useNostrProfileMutation({
    onSuccess: () => {
      toast.show("Profile saved");
    },
    onError: () => {
      toast.show("Failed to save profile");
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });
  const handleSave = async () => {
    if (!pubkey) {
      return;
    }

    setIsSaving(true);

    const event = await signEvent(
      makeProfileEvent(pubkey, { ...profile, name }),
    );

    if (event) {
      nostrProfileMutation.mutate(event);
    }
  };
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

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        alignItems: "center",
        gap: 24,
        paddingBottom: 80,
      }}
    >
      <Stack.Screen options={{ headerTitle: "Profile" }} />
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
          color={brandColors.black.light}
          onPress={handleRevealNsec}
          fullWidth
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
              Your private key (nsec) is stored securely on this device. Keep it
              safe! Your nsec is a secret and should never be shared with
              anyone.
            </Text>
            <Text style={{ fontSize: 18 }}>
              Your nsec maintains your identify across all of Nostr, so be
              mindful where you copy and paste it. It is typically not a good
              idea to paste this into websites and other apps you are unsure
              about.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
