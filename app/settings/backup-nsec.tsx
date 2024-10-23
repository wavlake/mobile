import { Button, Text, TextInput } from "@/components";
import { ScrollView, View } from "react-native";
import { useEffect, useState } from "react";
import { encodeNsec, getSeckey } from "@/utils";
import { CopyButton } from "@/components/CopyButton";
import { useRouter } from "expo-router";

export default function BackupNsec() {
  const [nsec, setNsec] = useState("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const seckey = await getSeckey();
      const nsec = encodeNsec(seckey ?? "");

      if (nsec) {
        setNsec(nsec);
      }
    })();
  }, []);

  return (
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
            secureTextEntry
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
              Wavlake does not have access to your private key, so if log out of
              the Wavlake app without backing up your nsec, you will lose access
              to your nostr account.
            </Text>
          </View>
          <Button onPress={router.back}>back</Button>
        </>
      )}
    </ScrollView>
  );
}
