import { Button, Text, TextInput } from "@/components";
import { ScrollView, View } from "react-native";
import { useAuth } from "@/hooks";
import { useEffect, useState } from "react";
import { encodeNsec, getSeckey } from "@/utils";
import { CopyButton } from "@/components/CopyButton";

export default function BackupNsec() {
  const { goToRoot } = useAuth();
  const [nsec, setNsec] = useState("");

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
              A Nostr private key (nsec) has been generated for you and is
              stored securely on this device. Your nsec is a secret and should
              never be shared with anyone.
            </Text>
            <Text style={{ fontSize: 18 }}>
              You can access your private key from your profile page and back it
              up later if you are unable to back it up securely right now. Just
              keep in mind that Wavlake does not have access to your private
              key, so if log out of Wavlake without backing up your nsec first,
              you will lose access to your account.
            </Text>
          </View>
          <Button onPress={goToRoot}>Ok, log me in</Button>
        </>
      )}
    </ScrollView>
  );
}
