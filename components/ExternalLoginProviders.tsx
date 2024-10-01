import { View, TouchableOpacity } from "react-native";
import { ElementType } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@/components/UserContextProvider";
import { ZBDIcon } from "@/components/ZBDIcon";
import { TwitterIcon } from "@/components/TwitterIcon";
import { GoogleIcon } from "@/components/GoogleIcon";
import { NostrIcon } from "@/components/NostrIcon";
import { useAuth, useToast } from "@/hooks";

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
        } else {
          if (result.hasExistingNostrProfile && !pubkey) {
            router.push({
              pathname: "/auth/nsec-login",
              params: {
                newNpub: result.createdNewNpub ? "true" : "false",
              },
            });
          } else {
            router.replace({
              pathname: result.isRegionVerified
                ? "/auth/auto-nwc"
                : "/auth/welcome",
              params: {
                newNpub: result.createdNewNpub ? "true" : "false",
              },
            });
          }
        }
        setIsLoading(false);
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
        router.push("/auth/nsec");
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
