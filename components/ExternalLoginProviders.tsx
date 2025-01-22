import { View, TouchableOpacity } from "react-native";
import { ElementType, Fragment } from "react";
import { useRouter } from "expo-router";
import { ZBDIcon, TwitterIcon, GoogleIcon, NostrIcon } from "./icons/";
import {
  DEFAULT_CONNECTION_SETTINGS,
  useAutoConnectNWC,
  useToast,
  useUser,
} from "@/hooks";
import DeviceInfo from "react-native-device-info";
import * as AppleAuthentication from "expo-apple-authentication";

interface BaseProvider {
  name: string;
}

type Provider =
  | (BaseProvider & {
      icon: ElementType;
      onPress: () => void;
      renderButton?: never;
    })
  | (BaseProvider & {
      renderButton: () => JSX.Element;
      icon?: never;
      onPress?: never;
    });

const ProviderButton: React.FC<{
  Icon: ElementType;
  onPress: () => void;
}> = ({ Icon, onPress }) => (
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
  const { signInWithGoogle, signInWithApple } = useUser();
  const { show } = useToast();

  const providers: Provider[] = [
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
    {
      name: "Apple",
      renderButton: () => (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={10}
          style={{ width: 200, height: 60 }}
          onPress={async () => {
            setIsLoading(true);
            const signedInUser = await signInWithApple();

            if ("error" in signedInUser) {
              show(signedInUser.error);
              setIsLoading(false);
              return;
            }

            if (signedInUser.isEmailVerified && signedInUser.isRegionVerified) {
              console.log("Connecting wallet");
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
            setIsLoading(false);
          }}
        />
      ),
    },
  ];

  return (
    <View
      style={{
        // display: "flex",
        // flexDirection: "row",
        // gap: 30,
        // alignItems: "center",
        // justifyContent: "center",

        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap", // Enable wrapping of items
        gap: 30, // Can adjust spacing between items
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {providers.map((provider) => {
        if (provider.renderButton) {
          return (
            <Fragment key={provider.name}>{provider.renderButton()}</Fragment>
          );
        }

        // Ensure both icon and onPress exist for standard buttons
        if (provider.icon && provider.onPress) {
          return (
            <ProviderButton
              key={provider.name}
              Icon={provider.icon}
              onPress={provider.onPress}
            />
          );
        }

        // Fallback or error handling
        console.warn(
          `Login provider is missing render method: ${JSON.stringify(
            provider,
          )}`,
        );
        return null;
      })}
    </View>
  );
};
