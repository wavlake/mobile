import { Button, Avatar, TextInput, Text } from "@/components";
import { Stack } from "expo-router";
import { ScrollView, View } from "react-native";
import { useState } from "react";
import {
  useAuth,
  useNostrProfile,
  useNostrProfileMutation,
  useToast,
} from "@/hooks";
import { makeProfileEvent } from "@/utils";
import { CopyButton } from "@/components/CopyButton";

export default function ProfilePage() {
  const { pubkey, npub, signEvent } = useAuth();
  const profile = useNostrProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const isSaveDisabled =
    profile?.name === name || name.length === 0 || isSaving;
  const toast = useToast();
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

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        alignItems: "center",
        gap: 24,
      }}
    >
      <Stack.Screen options={{ headerTitle: "Profile" }} />
      <Avatar size={120} />
      <TextInput label="username" value={name} onChangeText={setName} />
      <Button onPress={handleSave} disabled={isSaveDisabled} loading={isSaving}>
        Save
      </Button>
      <View style={{ width: "100%" }}>
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
    </ScrollView>
  );
}
