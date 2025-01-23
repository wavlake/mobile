import { View, ScrollView, Alert } from "react-native";
import { useAuth, useUser } from "@/hooks";
import {
  Button,
  Text,
  TextInput,
  NsecIntakePage,
  EditNsecModal,
} from "@/components";
import { useEffect, useState } from "react";
import { encodeNsec, getSeckey, useAddPubkeyToUser } from "@/utils";
import { CopyButton } from "@/components/CopyButton";
import { useRouter } from "expo-router";
import { nip19 } from "nostr-tools";

export default function BackupNsec() {
  const { pubkey, login, logout } = useAuth();
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
  const npub = nip19.npubEncode(pubkey);
  return pubkey ? (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingVertical: 20,
        alignItems: "center",
        gap: 24,
      }}
    >
      {nsec && (
        <>
          <TextInput
            label="nostr npub"
            readOnly
            value={npub}
            rightIcon={<CopyButton value={npub} />}
            includeErrorMessageSpace={false}
          />
          <TextInput
            label="nostr nsec"
            secureTextEntry
            value={nsec}
            readOnly
            rightIcon={<CopyButton value={nsec} />}
            includeErrorMessageSpace={false}
          />
          <View style={{ paddingBottom: 20, gap: 8 }}>
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
          <Button color="pink" onPress={() => setIsEditModalOpen(true)}>
            Update
          </Button>
          <Button
            color="red"
            onPress={() => {
              Alert.alert(
                "Are you sure?",
                "You are about to delete your nostr secret. Please make sure you have saved it somewhere safe before proceeding.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Continue",
                    style: "destructive",
                    onPress: async () => {
                      await logout();
                    },
                  },
                ],
              );
            }}
          >
            Delete
          </Button>
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
