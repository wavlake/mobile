import axios from "axios";
import { getAuthToken } from "./nip98";

const baseURL = process.env.EXPO_PUBLIC_WAVLAKE_API_URL;
const enableResponseLogging = Boolean(
  process.env.EXPO_PUBLIC_ENABLE_RESPONSE_LOGGING,
);

const apiClient = axios.create({ baseURL });

apiClient.interceptors.response.use(
  (response) => {
    if (!!response.data.error) {
      console.log(
        `Catalog error${
          response.headers["Authorization"] ? " (nostr auth):" : ":"
        }`,
        response.data.error,
      );
    } else {
      enableResponseLogging &&
        console.log(
          `Catalog${
            response.headers["Authorization"] ? " (nostr auth):" : ":"
          }`,
          response?.request?.responseURL?.split(".com")[1],
        );
    }

    return response;
  },
  (error) => {
    if (typeof error.response.data.error === "string") {
      const apiErrorMessage = error.response.data.error;
      return Promise.reject(apiErrorMessage);
    } else {
      console.log("Catalog error:", error);
      console.error(error);
      return Promise.reject("An error occurred");
    }
  },
);

export const createAuthHeader = async (
  relativeUrl: string,
  httpMethod: "get" | "post" | "delete" | "put" = "get",
  payload?: Record<string, any>,
) => {
  const url = `${baseURL}${relativeUrl}`;
  return getAuthToken(url, httpMethod, true, payload);
};

export { apiClient };
