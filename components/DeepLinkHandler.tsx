import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

const ROUTE_MAPPING = {
  "/playlist/": (id: string) => `/library/music/playlists/${id}`,
};

const DeepLinkHandler = () => {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink: Linking.URLListener = async (event) => {
      console.log("new event:", event);
      const { path, queryParams } = Linking.parse(event.url);
      for (const [path, getMobilePath] of Object.entries(ROUTE_MAPPING)) {
        console.log("mapped path:", path);
        if (path.startsWith(path)) {
          const id = path.split("/")[2];
          console.log("id:", id);
          const mobilePath = getMobilePath(id);
          router.replace(mobilePath);
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
