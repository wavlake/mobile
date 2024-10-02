import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useUser } from "./UserContextProvider";
import { useToast } from "@/hooks";

const ROUTE_MAPPING: Record<
  string,
  {
    getPath: (id: string) => string;
    includeBackButton: "true" | "false";
    history: string[];
  }
> = {
  "playlist/": {
    getPath: (id: string) => `/library/music/playlist/${id}`,
    includeBackButton: "true",
    history: ["/library"],
  },
  "album/": {
    getPath: (id: string) => `/album/${id}`,
    includeBackButton: "true",
    history: ["/library"],
  },
  "": {
    getPath: (name: string) => `/artist/${name}`,
    includeBackButton: "true",
    history: ["/library"],
  },
};

const DeepLinkHandler = () => {
  const toast = useToast();
  const router = useRouter();
  const { verifyEmailLink } = useUser();

  useEffect(() => {
    const handleDeepLink: Linking.URLListener = async (event) => {
      const { path, queryParams } = Linking.parse(event.url);
      const urlParams = new URL(event.url).searchParams;
      const emailLinkAction = urlParams.get("mode");

      // Handle email verification
      if (emailLinkAction === "verifyEmail") {
        const result = await verifyEmailLink(event.url);
        if (result.success) {
          // navigate to email verification screen to resume process
          router.replace({
            pathname: "/auth/email-ver",
            params: {
              navFromEmailVerLink: "true",
            },
          });
        } else {
          const errorMessage =
            "error" in result ? result.error : "An unexpected error occurred.";
          toast.show(errorMessage);
          router.replace({
            pathname: "/auth/error",
            params: { errorMessage },
          });
        }
        return;
      } else if (emailLinkAction === "resetPassword") {
        // TODO - navigate to reset password screen and call resetPassword
        toast.show(
          "Reset password not yet supported. Please visit wavlake.com to reset your password.",
        );
      } else if (emailLinkAction === "recoverEmail") {
        // TODO
        toast.show(
          "Email recovery not yet supported. Please visit wavlake.com to recover your email.",
        );
      }

      // special NWC case
      if (event.url.startsWith("nostr+walletconnect")) {
        router.push({
          pathname: "/nwc",
          params: {
            uri: event.url,
          },
        });
        return;
      }

      // existing deep link handling
      if (!path) return;
      for (const [
        route,
        { getPath, history, includeBackButton },
      ] of Object.entries(ROUTE_MAPPING)) {
        if (path.startsWith(route)) {
          const id = path.split("/")[1];
          const mobilePath = getPath(id);
          console.log("Handling universal link:", { path, id, mobilePath });

          history.forEach((path) => router.push(path));
          router.push({
            pathname: mobilePath,
            params: {
              includeBackButton: "true",
            },
          });
          return;
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [router]);

  return null;
};

export default DeepLinkHandler;
