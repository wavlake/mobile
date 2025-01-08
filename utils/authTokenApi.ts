import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import auth from "@react-native-firebase/auth";
import { normalizeTrackResponse } from "./api";
import { PrivateUserData, ResponseObject, TrackResponse } from "./types";
import { useAuth, useUser } from "@/hooks";
import { deleteSecretFromKeychain } from "./keychainStorage";

const catalogApi = process.env.EXPO_PUBLIC_WAVLAKE_API_URL;
const enableResponseLogging = Boolean(
  process.env.EXPO_PUBLIC_ENABLE_RESPONSE_LOGGING,
);

export const catalogApiClient = axios.create({
  baseURL: catalogApi,
});

// this interceptor handles errors and doesn't need to be updated once registered
const responseInterceptor = catalogApiClient.interceptors.response.use(
  // on response fulfilled (200 response)
  (response) => {
    if (!!response.data.error) {
      console.log("Catalog (fb auth):", response.data.error);
    } else {
      if (enableResponseLogging) {
        const byteSizeOfResponse = new Blob([JSON.stringify(response.data)])
          .size;
        console.log(
          "Catalog (fb auth):",
          response.request.responseURL?.split(".com")[1],
          byteSizeOfResponse,
          "bytes",
        );
      }
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

export const usePrivateUserData = (enabled: boolean) => {
  return useQuery<PrivateUserData>(
    ["userData"],
    async () => {
      const { data } = await catalogApiClient
        .get<ResponseObject<PrivateUserData>>(`/accounts`)
        .catch((error) => {
          console.log("usePrivateUserData error", error);
          throw error;
        });

      return data.data;
    },
    {
      enabled,
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

export const useEditUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      user: Partial<Omit<UserEditForm, "ampSat"> & { ampMsat: number }>,
    ) => {
      const formIsEmpty = !Object.values(user).some(
        (value) => value !== undefined && value !== null,
      );
      if (formIsEmpty) {
        return;
      }

      const requestFormData = new FormData();

      if (user.name) {
        requestFormData.append("name", user.name);
      }

      if (user.ampMsat) {
        requestFormData.append("ampMsat", user.ampMsat.toString());
      }

      if (user.artwork) {
        requestFormData.append("artwork", user.artwork as any);
      }

      const { data } = await catalogApiClient.put<
        ResponseObject<{ userId: string }>
      >("/accounts", requestFormData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (data) => data, // Prevent axios from trying to transform the FormData
      });

      return data.data;
    },
    onSuccess(data) {
      queryClient.invalidateQueries(["userData"]);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const { signOut } = useUser();
  return useMutation({
    mutationFn: async () => {
      const { data } =
        await catalogApiClient.put<ResponseObject<never>>("/accounts/disable");

      return data;
    },
    onSuccess(data) {
      // nostr logout
      logout();
      // firebase logout
      signOut();
      // delete user's nostr secret
      deleteSecretFromKeychain();
      queryClient.invalidateQueries(["userData"]);
    },
  });
};

export interface WalletConnection {
  name: string;
  pubkey: string;
  requestMethods: WalletConnectionMethods[];
  lastUsed?: string;
  msatBudget: number;
  maxMsatPaymentAmount: number;
}

export type WalletConnectionMethods =
  | "get_balance"
  | "pay_invoice"
  | "make_invoice"
  | "lookup_invoice";

export const useCreateConnection = (onSuccess?: Function) => {
  return useMutation({
    mutationFn: async (connection: WalletConnection) => {
      const { data } = await catalogApiClient.post<
        ResponseObject<WalletConnection>
      >(`/accounts/connections`, connection, {});
      return data.data;
    },
    onSuccess(data) {
      onSuccess?.(data);
    },
  });
};

interface Transaction {
  comment: any;
  createDate: string;
  failureReason: string;
  feeMsat: any;
  feemsat: any;
  id: number;
  isPending: false;
  ispending: false;
  msatAmount: string;
  paymentId: string;
  paymentid: string;
  success: any;
  title: string;
  type: string;
}

export const getTransactionHistory = async (page: number) => {
  const { data } = await catalogApiClient.get<
    ResponseObject<{
      pagination: {
        currentPage: number;
        perPage: number;
        total: number;
        totalPages: number;
      };
      transactions: Record<string, Transaction[]>;
    }>
  >(`/accounts/txs/${page}`, {});

  return data.data;
};

export interface Promo {
  promoUser: {
    canEarnToday: boolean;
    lifetimeEarnings: number;
    earnedToday: number;
    earnableToday: number;
  };
  id: number;
  msatBudget: number;
  msatPayoutAmount: number;
  contentId: string;
  contentType: string;
}

export const getUserPromos = async () => {
  const { data } =
    await catalogApiClient.get<
      ResponseObject<Array<Promo & { contentMetadata: TrackResponse }>>
    >("/promos/active");
  return data.data.map((promo) => {
    if (!promo) return;

    const [normalizedTrackData] = normalizeTrackResponse([
      promo.contentMetadata,
    ]);
    return {
      ...promo,
      contentMetadata: normalizedTrackData,
    };
  });
};

export const getPromoByContentId = async (contentId: string) => {
  const { data } = await catalogApiClient.get<ResponseObject<Promo>>(
    `/promos/content/${contentId}`,
  );

  return data.data;
};

export const saveUserIdentity = async (data: {
  firstName: string;
  lastName: string;
}) => {
  const { data: response } = await catalogApiClient.post<
    ResponseObject<{ userId: string }>
  >(`/accounts/log-identity`, data);
  return response.data;
};

export const useCreateNewUser = () => {
  return useMutation({
    mutationFn: async (body: { username?: string; pubkey: string }) => {
      const { data } = await catalogApiClient.post<
        ResponseObject<{
          username: string;
          profileUrl: string;
          pubkey: string;
          loginToken: string;
        }>
      >(`/accounts/user`, body);

      return data.data;
    },
  });
};

// this API endpoint is gaurded by an IP region check
export const useCreateNewVerifiedUser = () => {
  return useMutation({
    mutationFn: async (body: {
      username?: string;
      firstName?: string;
      lastName?: string;
      pubkey: string;
    }) => {
      const { data } = await catalogApiClient.post<
        ResponseObject<{
          username: string;
          profileUrl: string;
          pubkey: string;
          loginToken: string;
        }>
      >(`/accounts/user/verified`, body);

      return data.data;
    },
  });
};

export const useAccountTracks = () => {
  return useQuery(["accountTracks"], async () => {
    const { data } =
      await catalogApiClient.get<ResponseObject<TrackResponse[]>>(
        `/tracks/account`,
      );

    return data.data;
  });
};
