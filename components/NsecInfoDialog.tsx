import { TouchableOpacity, View } from "react-native";
import { DialogWrapper } from "./DialogWrapper";
import { Button } from "./Button";
import { Text } from "./Text";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

export const NsecInfoDialog = () => {
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const { colors } = useTheme();

  return (
    <>
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
          <Ionicons name="help-circle-outline" size={30} color={colors.text} />
        </View>
      </TouchableOpacity>
      <Dialog isOpen={isInfoDialogOpen} setIsOpen={setIsInfoDialogOpen} />
    </>
  );
};

const Dialog = ({
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
