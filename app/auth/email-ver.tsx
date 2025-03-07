import { Text, Button, Center } from "@/components";
import {
  DEFAULT_CONNECTION_SETTINGS,
  useAutoConnectNWC,
  useToast,
  useUser,
  useFirebaseDeepLink,
} from "@/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
  TouchableOpacity,
} from "react-native";
import DeviceInfo from "react-native-device-info";

export default function EmailVer() {
  const { errorMessage } = useLocalSearchParams<{
    errorMessage: string;
  }>();

  const { resendVerificationEmail, checkIfEmailIsVerified, refetchUser } =
    useUser();
  const { connectWallet } = useAutoConnectNWC();
  const router = useRouter();
  const toast = useToast();
  const openEmailClient = async () => {
    // List of common email app URL schemes
    const emailAppSchemes = [
      "message://", // iOS Mail
      "googlegmail://", // Gmail
      "ms-outlook://", // Outlook
      "ymail://", // Yahoo Mail
      "readdle-spark://", // Spark
      "airmail://", // Airmail
    ];

    // Try opening each email app scheme
    for (const scheme of emailAppSchemes) {
      const canOpen = await Linking.canOpenURL(scheme);
      if (canOpen) {
        await Linking.openURL(scheme);
        return; // Exit the function if we successfully opened an email app
      }
    }

    // If no email app was opened, try a generic mailto: link
    const mailtoUrl = "mailto:";
    const canOpenMailto = await Linking.canOpenURL(mailtoUrl);
    if (canOpenMailto) {
      await Linking.openURL(mailtoUrl);
    } else {
      // If all attempts fail, show an alert
      toast.show(
        "We couldn't find an email app on your device. Please check your email manually.",
      );
    }
  };

  const handleCheckAgain = async () => {
    const { success, isVerified, error } = await checkIfEmailIsVerified();
    if (isVerified) {
      const catalogUser = await refetchUser();
      // auto connect NWC if user is region verified
      if (catalogUser?.isRegionVerified) {
        await connectWallet(
          {
            ...DEFAULT_CONNECTION_SETTINGS,
            connectionName: DeviceInfo.getModel(),
          },
          catalogUser.id,
        );
      }
      router.push({ pathname: "/auth/welcome" });
    } else if (success) {
      toast.show("Please check your email for a verification link");
    } else {
      toast.show(error ?? "Something went wrong. Please try again later.");
    }
  };

  useFirebaseDeepLink({ onDone: handleCheckAgain });

  const handleResend = async () => {
    const { success, isVerified, error } = await checkIfEmailIsVerified();
    if (isVerified) {
      router.push({ pathname: "/auth/welcome" });
    } else if (success) {
      await resendVerificationEmail();
      toast.show("Verification email sent");
    } else {
      toast.show(error ?? "Something went wrong. Please try again later.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <Center
        style={{
          paddingHorizontal: 24,
        }}
      >
        {errorMessage ? (
          <Text style={{ color: "white", paddingBottom: 40 }}>
            {errorMessage}
          </Text>
        ) : (
          <View
            style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 40,
            }}
          >
            <Text
              style={{
                fontSize: 14,
              }}
            >
              Please check your email for a verification link
            </Text>
            <Button color="white" onPress={handleCheckAgain}>
              Verify
            </Button>
            <TouchableOpacity onPress={openEmailClient}>
              <Text style={{ fontSize: 18 }} bold>
                Open Email App
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleResend}>
              <Text style={{ fontSize: 18 }} bold>
                Re-send Verification Email
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={{
            marginBottom: 60,
          }}
          onPress={() => {
            router.canGoBack() ? router.back() : router.replace("/");
          }}
        >
          <Text style={{ fontSize: 18 }} bold>
            Go Back
          </Text>
        </TouchableOpacity>
      </Center>
    </TouchableWithoutFeedback>
  );
}
