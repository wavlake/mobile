import { Button, Avatar, TextInput } from "@/components";
import { Stack } from "expo-router";
import { View, ScrollView } from "react-native";
import { useState } from "react";
import { useAuth, useNostrProfile, useNostrProfileMutation } from "@/hooks";
import { makeProfileEvent } from "@/utils";

export default function ProfilePage() {
  const { pubkey, signEvent } = useAuth();
  const profile = useNostrProfile();
  const [isSaving, setIsSaving] = useState(false);
  const defaultSaveButtonText = "Save";
  const [saveButtonText, setSaveButtonText] = useState(defaultSaveButtonText);
  const [name, setName] = useState(profile?.name ?? "");
  const isSaveDisabled =
    profile?.name === name || name.length === 0 || isSaving;
  const nostrProfileMutation = useNostrProfileMutation({
    onSuccess: () => {
      setSaveButtonText("Saved!");
      setTimeout(() => {
        setSaveButtonText(defaultSaveButtonText);
      }, 3000);
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
      contentContainerStyle={{ padding: 24, alignItems: "center", gap: 24 }}
    >
      <Stack.Screen options={{ headerTitle: "Profile" }} />
      <Avatar size={120} />
      <View style={{ width: "100%" }}>
        <TextInput label="username" value={name} onChangeText={setName} />
      </View>
      <Button onPress={handleSave} disabled={isSaveDisabled} loading={isSaving}>
        {saveButtonText}
      </Button>
    </ScrollView>
  );
}
