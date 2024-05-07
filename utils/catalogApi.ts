import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import auth from "@react-native-firebase/auth";

const apiProtocol = process.env.NEXT_PUBLIC_CATALOG_PROTOCOL;
const apiHost = process.env.NEXT_PUBLIC_CATALOG_HOST;
const apiPort = process.env.NEXT_PUBLIC_CATALOG_PORT;
const catalogApi = `${apiProtocol}://${apiHost}:${apiPort}/v1`;

// response.data should have this shape
export interface ResponseObject<T = any> {
  error?: string;
  success: boolean;
  data: T;
}

export const catalogApiClient = axios.create({
  baseURL: catalogApi,
});

// this interceptor handles errors and doesn't need to be updated once registered
const responseInterceptor = catalogApiClient.interceptors.response.use(
  // on response fulfilled (200 response)
  (response) => {
    if (!!response.data.error) {
      console.log("error", response.data.error);
    }

    return response;
  },
  // on response rejected (non 200 response)
  (error: AxiosError) => {
    const errorObject = error?.response?.data;

    // TODO - improve error handling here
    // const { response, request } = error;
    // wavlakeErrorHandler(response?.data);

    // need to throw the response, else it will be swallowed here
    throw errorObject;
  },
);

// this interceptor adds the auth token
const requestInterceptor = catalogApiClient.interceptors.request.use(
  // on request fulfilled
  async (config) => {
    const currentUser = auth().currentUser;
    if (currentUser && config.headers) {
      const requestAuthToken = await currentUser.getIdToken();

      config.headers.authorization = `Bearer ${requestAuthToken}`;
    }
    return config;
  },
);

export interface PrivateUserData {
  id: string;
  name: string;
  msatBalance: string;
  ampMsat: number;
  artworkUrl: string | null;
  profileUrl: string;
  isLocked: boolean;
  userFavoritesId: string;
  userFavorites: string[];
  emailVerified: boolean;
  isRegionVerified: boolean;
  providerId: string;
  lightningAddress: string | null;
}

export const usePrivateUserData = () => {
  return useQuery<PrivateUserData>(
    ["userData"],
    async () => {
      console.log("fetching user data");
      const { data } = await catalogApiClient
        .get<ResponseObject<PrivateUserData>>(`/accounts`)
        .catch((error) => {
          console.log("error", error);
          throw error;
        });

      return data.data;
    },
    {
      enabled: false,
      retry: false,
    },
  );
};
