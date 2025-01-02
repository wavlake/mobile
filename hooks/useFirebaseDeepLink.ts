import { useEffect } from "react";
import * as Linking from "expo-linking";
import { RouteParams } from "expo-router";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/useToast";

export const useFirebaseDeepLink = ({ onDone }: { onDone: Function }) => {
  const { verifyEmailLink } = useUser();
  const toast = useToast();

  const handleEmailDeepLink = async (url: string) => {
    if (!url) return;

    const urlParams = new URL(url).searchParams;
    const emailLinkAction = urlParams.get("mode");

    switch (emailLinkAction) {
      case "verifyEmail": {
        const result = await verifyEmailLink(url);
        if (result.success) {
          toast.show("Email verified!");
        } else {
          const errorMessage =
            "error" in result ? result.error : "An unexpected error occurred.";
          toast.show(errorMessage);
        }
        onDone();
        break;
      }
      case "resetPassword": {
        toast.show(
          "Reset password not yet supported. Please visit wavlake.com to reset your password.",
        );
        break;
      }
      case "recoverEmail": {
        toast.show(
          "Email recovery not yet supported. Please visit wavlake.com to recover your email.",
        );
        break;
      }
    }
  };

  useEffect(() => {
    // Handle initial deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleEmailDeepLink(url);
    });

    // Handle deep links when app is running
    const subscription = Linking.addEventListener("url", (event) => {
      handleEmailDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return;
};
