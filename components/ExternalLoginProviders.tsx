import { View, TouchableOpacity } from "react-native";
import { ElementType } from "react";
import { useRouter } from "expo-router";
import { ZBDIcon, TwitterIcon, GoogleIcon, NostrIcon } from "./icons/";
import {
  DEFAULT_CONNECTION_SETTINGS,
  useAutoConnectNWC,
  useToast,
  useUser,
} from "@/hooks";
import DeviceInfo from "react-native-device-info";

const ProviderButton: React.FC<{ Icon: ElementType; onPress: () => void }> = ({
  Icon,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{ backgroundColor: "white", padding: 10, borderRadius: 10 }}
  >
    <Icon fill="black" width={40} height={40} />
  </TouchableOpacity>
);

export const ExternalLoginProviders = ({
  setIsLoading,
}: {
  setIsLoading: (loading: boolean) => void;
}) => {
  const { connectWallet } = useAutoConnectNWC();
  const router = useRouter();
  const { signInWithGoogle } = useUser();
  const { show } = useToast();
  const providers = [
    {
      name: "Google",
      icon: GoogleIcon,
      onPress: async () => {
        setIsLoading(true);
        const signedInUser = await signInWithGoogle();
        if ("error" in signedInUser) {
          show(signedInUser.error);
          setIsLoading(false);
          return;
        }

        if (signedInUser.isEmailVerified && signedInUser.isRegionVerified) {
          await connectWallet(
            {
              ...DEFAULT_CONNECTION_SETTINGS,
              connectionName: DeviceInfo.getModel(),
            },
            signedInUser.user.uid,
          );
        }
        router.replace({
          pathname: "/auth/welcome",
        });
      },
    },
    // TODO: implement these providers
    // {
    //   name: "Twitter",
    //   icon: TwitterIcon,
    //   onPress: async () => {
    //     // signInWithTwitter
    //   },
    // },
    // {
    //   name: "ZBD",
    //   icon: ZBDIcon,
    //   onPress: async () => {
    //     // router.push("/auth/nsec");
    //   },
    // },
    {
      name: "Nostr",
      icon: NostrIcon,
      onPress: () => {
        setIsLoading(true);
        router.push({
          pathname: "/nsec",
          params: { nostrOnlyLogin: "true" },
        });
        setIsLoading(false);
      },
    },
  ];

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 30,
      }}
    >
      {providers.map((provider) => (
        <ProviderButton
          key={provider.name}
          Icon={provider.icon}
          onPress={provider.onPress}
        />
      ))}
    </View>
  );
};
