import { PropsWithChildren, useEffect, useState } from "react";
import * as Linking from "expo-linking";
import { useToast, useUser } from "@/hooks";
import { RouteParams, useRouter } from "expo-router";

export const ROUTE_MAPPING: Record<
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
  "verification-link": {
    getPath: (id: string) => `/auth/email-ver`,
    includeBackButton: "false",
    history: [],
  },
};

interface InitialState {
  routes: Array<{
    name: string;
    params?: RouteParams<string>;
  }>;
}

const DeepLinkHandler: React.FC<PropsWithChildren> = ({ children }) => {
  const [initialState, setInitialState] = useState<InitialState | undefined>();
  const toast = useToast();
  const { verifyEmailLink } = useUser();
  const router = useRouter();
  useEffect(() => {
    const handleDeepLink = async (url: string | null) => {
      if (!url) {
        return;
      }

      const { path } = Linking.parse(url);
      const urlParams = new URL(url).searchParams;
      const emailLinkAction = urlParams.get("mode");

      if (emailLinkAction === "verifyEmail") {
        const result = await verifyEmailLink(url);
        if (result.success) {
          setInitialState({
            routes: [
              {
                name: "/auth/email-ver",
                params: {
                  navFromEmailVerLink: "true",
                  createdRandomNpub: "true",
                },
              },
            ],
          });
        } else {
          const errorMessage =
            "error" in result ? result.error : "An unexpected error occurred.";
          toast.show(errorMessage);
          setInitialState({
            routes: [
              {
                name: "/auth/email-ver",
                params: { errorMessage },
              },
            ],
          });
        }
      } else if (emailLinkAction === "resetPassword") {
        toast.show(
          "Reset password not yet supported. Please visit wavlake.com to reset your password.",
        );
      } else if (emailLinkAction === "recoverEmail") {
        toast.show(
          "Email recovery not yet supported. Please visit wavlake.com to recover your email.",
        );
      } else if (url.startsWith("nostr+walletconnect")) {
        setInitialState({
          routes: [
            {
              name: "/nwc",
              params: { uri: url },
            },
          ],
        });
      } else if (path) {
        for (const [
          route,
          { getPath, history, includeBackButton },
        ] of Object.entries(ROUTE_MAPPING)) {
          if (path.startsWith(route)) {
            const id = path.split("/")[1];
            const mobilePath = getPath(id);
            setInitialState({
              routes: [
                ...history.map((path) => ({ name: path })),
                {
                  name: mobilePath,
                  params: {
                    includeBackButton: includeBackButton ? "true" : "false",
                  },
                },
              ],
            });
            break;
          }
        }
      }
    };

    Linking.getInitialURL().then(handleDeepLink);

    const subscription = Linking.addEventListener("url", (event) =>
      handleDeepLink(event.url),
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (initialState && initialState.routes.length > 0) {
      const route = initialState.routes[0];
      console.log("Navigating to:", route.name, route.params);
      router.replace({
        pathname: route.name as any,
        params: route.params,
      });
    }
  }, [initialState]);

  return children;
};

export default DeepLinkHandler;
