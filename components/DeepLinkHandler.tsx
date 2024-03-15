import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

const ROUTE_MAPPING = {
  "playlist/": (id: string) => `/library/music/playlists/${id}`,
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
