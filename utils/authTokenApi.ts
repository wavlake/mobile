import axios, { AxiosError } from "axios";
import auth from "@react-native-firebase/auth";
import { normalizeTrackResponse } from "./api";
import { ResponseObject, TrackResponse } from "./types";

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
