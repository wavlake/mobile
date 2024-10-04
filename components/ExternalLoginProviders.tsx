import { View, TouchableOpacity } from "react-native";
import { ElementType } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@/components/UserContextProvider";
import { ZBDIcon } from "@/components/ZBDIcon";
import { TwitterIcon } from "@/components/TwitterIcon";
import { GoogleIcon } from "@/components/GoogleIcon";
import { NostrIcon } from "@/components/NostrIcon";
import { DEFAULT_CONNECTION_SETTINGS, useAuth, useToast } from "@/hooks";
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
  const router = useRouter();
  const { pubkey } = useAuth();
  const { signInWithGoogle } = useUser();
  const { show } = useToast();
  const providers = [
    {
      name: "Google",
      icon: GoogleIcon,
      onPress: async () => {
        setIsLoading(true);
        const result = await signInWithGoogle();
        if ("error" in result) {
          show(result.error);
          setIsLoading(false);
          return;
        }

        if (result.isEmailVerified && result.isRegionVerified) {
          await connectWallet({
            ...DEFAULT_CONNECTION_SETTINGS,
            connectionName: DeviceInfo.getModel(),
          });
        }
        // if the user isn't pubkey-logged in via signInWithEmail above
        // we need to collect their previously used nsec
        if (!pubkey) {
          router.push({
            pathname: "/auth/nsec",
            params: {
              createdRandomNpub: result.createdRandomNpub ? "true" : "false",
              userAssociatedPubkey: result.userAssociatedPubkey,
            },
          });
        } else {
          router.replace({
            pathname: "/auth/welcome",
            params: {
              createdRandomNpub: result.createdRandomNpub ? "true" : "false",
            },
          });
        }
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
          pathname: "/auth/nsec",
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
function connectWallet(arg0: any) {
  throw new Error("Function not implemented.");
}
