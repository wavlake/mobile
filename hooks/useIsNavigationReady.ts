import { useEffect, useState } from "react";
import { useRootNavigation } from "expo-router";

export const useIsNavigationReady = () => {
  const rootNavigation = useRootNavigation();
  const [isNavigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    const unsubscribe = rootNavigation?.addListener("state", () => {
      setNavigationReady(true);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [rootNavigation]);

  return isNavigationReady;
};
