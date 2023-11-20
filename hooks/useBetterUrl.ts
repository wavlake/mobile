import { getInitialURL, useURL } from "expo-linking";
import { useState, useEffect } from "react";

export const useBetterURL = (): string | null | undefined => {
  const url = useURL();
  const [urlState, setUrlState] = useState<string | null | undefined>(
    undefined,
  );

  useEffect(() => {
    async function updateURL() {
      if (urlState === undefined) {
        // It seems like url is always null from the useURL (possibly because of the async nature of getInitialURL) until we explicitly call getInitialUrl.
        // So therefore, first time the URL gets a value from useURL, we call getInitialURL ourselves to get the first value.
        // See https://github.com/expo/expo/issues/23333
        const initialUrl = await getInitialURL();
        setUrlState(initialUrl);
        return;
      }

      if (url === urlState) {
        return;
      }

      setUrlState(url);
    }

    void updateURL();
  }, [url, urlState]);

  return urlState;
};
