import { View, ScrollView, StyleSheet } from "react-native";
import { useAuth } from "@/hooks";
import {
  Button,
  Text,
  TextInput,
  NsecIntakePage,
  EditNsecModal,
  useUser,
} from "@/components";
import { useEffect, useState } from "react";
import { encodeNsec, getSeckey, useAddPubkeyToUser } from "@/utils";
import { CopyButton } from "@/components/CopyButton";
import { useRouter } from "expo-router";

export default function BackupNsec() {
  const { pubkey, login } = useAuth();
  const [nsec, setNsec] = useState("");
  const router = useRouter();
  const { catalogUser } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { mutateAsync: addPubkeyToAccount } = useAddPubkeyToUser({});

  useEffect(() => {
    (async () => {
      const seckey = await getSeckey();
      const nsec = encodeNsec(seckey ?? "");

      if (nsec) {
        setNsec(nsec);
      }
    })();
  }, []);

  const handleSaveNsec = async (nsec: string) => {
    try {
      const success = await login(nsec);
      if (!success) {
        console.error("Failed to login with new nsec");
        return;
      }

      setNsec(nsec);
      if (catalogUser) {
        await addPubkeyToAccount();
      }
    } catch (error) {
      console.error("Failed to update nsec:", error);
    }
  };

  return pubkey ? (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingVertical: 40,
        alignItems: "center",
        gap: 24,
      }}
    >
      {nsec && (
        <>
          <TextInput
            label="nostr nsec"
            // secureTextEntry
            value={nsec}
            editable={false}
            rightIcon={<CopyButton value={nsec} />}
          />
          <View style={{ paddingBottom: 40, gap: 16 }}>
            <Text style={{ fontSize: 18 }} bold>
              HEADS UP!
            </Text>
            <Text style={{ fontSize: 18 }}>
              This is your Nostr private key (nsec) that is currently being
              stored securely on this device. Your nsec is a secret and should
              never be shared with anyone.
            </Text>
            <Text style={{ fontSize: 18 }}>
              Wavlake does not have access to your key, so if you change it now
              without backing it up first you will lose access to your current
              Nostr identity and history.
            </Text>
          </View>
          <Button onPress={() => setIsEditModalOpen(true)}>Update</Button>
          <Button color="white" onPress={router.back}>
            Cancel
          </Button>
          <EditNsecModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveNsec}
            currentPubkey={pubkey}
          />
        </>
      )}
    </ScrollView>
  ) : (
    <NsecIntakePage />
  );
}
