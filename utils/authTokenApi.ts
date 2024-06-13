import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import auth from "@react-native-firebase/auth";
import { ResponseObject } from "./api";
import { NostrUserProfile } from "./nostr";

const catalogApi = process.env.EXPO_PUBLIC_WAVLAKE_API_URL;

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

export interface NostrProfileData {
  publicHex: string;
  metadata: {
    name: string;
    npub: string;
    about?: string;
    lud16?: string;
    nip05?: string;
    banner?: string;
    pubkey: string;
    picture?: string;
    created_at: number;
    nip05valid?: boolean;
    display_name?: string;
    displayName?: string;
    username?: string;
  } & NostrUserProfile;
  followerCount: number;
  follows: { pubkey: string; relay?: string; petname?: string }[];
}
export interface PrivateUserData {
  id: string;
  name: string;
  msatBalance: string;
  ampMsat: number;
  artworkUrl?: string;
  profileUrl: string;
  isLocked: boolean;
  userFavoritesId: string;
  userFavorites: string[];
  emailVerified: boolean;
  isRegionVerified: boolean;
  providerId: string;
  lightningAddress?: string;
  nostrProfileData: NostrProfileData[];
}

export const usePrivateUserData = () => {
  return useQuery<PrivateUserData>(
    ["userData"],
    async () => {
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

interface UserEditForm {
  name: string;
  ampSat: string;
  artwork?: any;
  artworkUrl?: any;
  uid: string;
}

export const useEditUser = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      user: Omit<UserEditForm, "ampSat"> & { ampMsat: number },
    ) => {
      const requestFormData = new FormData();
      requestFormData.append("name", user.name);
      requestFormData.append("ampMsat", user.ampMsat.toString());
      user.artwork &&
        requestFormData.append(
          "artwork",
          user.artwork as any as Blob,
          `${user.uid}.jpg`,
        );

      const { data } = await catalogApiClient.put<
        ResponseObject<{ userId: string }>
      >(`/accounts`, requestFormData);
      return data.data;
    },
    onSuccess() {
      queryClient.invalidateQueries(["userData"]);
      onSuccess?.();
    },
    onError(response: ResponseObject) {
      onError?.(response.error ?? "Error editing user");
    },
  });
};
