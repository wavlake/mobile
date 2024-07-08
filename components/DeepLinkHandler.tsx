import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

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
  // used for artists
  "": {
    getPath: (name: string) => `/artist/${name}`,
    includeBackButton: "true",
    history: ["/library"],
  },
  // TODO - build out mobile track page
  // "track/": (id: string) => `/music/playlists/${id}`,
};

const DeepLinkHandler = () => {
  const router = useRouter();
  useEffect(() => {
    const handleDeepLink: Linking.URLListener = async (event) => {
      const { path, queryParams } = Linking.parse(event.url);
      // special NWC case
      // for "Open in supported app" links
      if (event.url.startsWith("nostr+walletconnect")) {
        router.push({
          pathname: "/nwc",
          params: {
            uri: event.url,
          },
        });
        return;
      }

      // example: path = "/playlist/<playlist-ID>
      if (!path) return;
      for (const [
        route,
        { getPath, history, includeBackButton },
      ] of Object.entries(ROUTE_MAPPING)) {
        if (path.startsWith(route)) {
          const id = path.split("/")[1];
          const mobilePath = getPath(id);
          // keeping temporarily to aid in debugging, can remove once deep links are stable
          console.log("Handling universal link:", { path, id, mobilePath });

          // this is needed to replicate the navigation path the user would have normally taken to reach the deep link
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
