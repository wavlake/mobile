import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

const ROUTE_MAPPING = {
  "playlist/": (id: string) => `/library/music/playlists/${id}`,
  "album/": (id: string) => `/album/${id}`,
  // used for artists
  "": (name: string) => `/artist/${name}`,
  // TODO - build out mobile track page
  // "track/": (id: string) => `/music/playlists/${id}`,
};

const DeepLinkHandler = () => {
  const router = useRouter();
  useEffect(() => {
    const handleDeepLink: Linking.URLListener = async (event) => {
      // example: path = "/playlist/<playlist-ID>
      const { path, queryParams } = Linking.parse(event.url);
      if (!path) return;
      for (const [route, getMobilePath] of Object.entries(ROUTE_MAPPING)) {
        if (path.startsWith(route)) {
          const id = path.split("/")[1];
          const mobilePath = getMobilePath(id);
          // keeping temporarily to aid in debugging, can remove once deep links are stable
          console.log("Handling universal link:", { path, id, mobilePath });
          router.push(mobilePath);
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
