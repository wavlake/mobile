import axios from "axios";
import { getAuthToken } from "./nip98";
import { configureLoggingInterceptors } from "./api-interceptors";

const baseURL = process.env.EXPO_PUBLIC_WAVLAKE_API_URL;
const apiClient = axios.create({ baseURL });

configureLoggingInterceptors(apiClient, "Catalog");

export const createAuthHeader = async (
  relativeUrl: string,
  httpMethod: "get" | "post" | "delete" | "put" = "get",
  payload?: Record<string, any>,
) => {
  const url = `${baseURL}${relativeUrl}`;
  return getAuthToken(url, httpMethod, true, payload);
};

export { apiClient };
