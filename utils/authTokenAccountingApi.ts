import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import auth from "@react-native-firebase/auth";
import { ResponseObject } from "./api";
import { Event } from "nostr-tools";
import { Promo } from "./authTokenApi";

const accountingApi = process.env.EXPO_PUBLIC_WAVLAKE_ACCOUNTING_API_URL;
const enableResponseLogging = Boolean(
  process.env.EXPO_PUBLIC_ENABLE_RESPONSE_LOGGING,
);

export const accountingApiClient = axios.create({
  baseURL: accountingApi,
});

// this interceptor handles errors and doesn't need to be updated once registered
const responseInterceptor = accountingApiClient.interceptors.response.use(
  // on response fulfilled (200 response)
  (response) => {
    if (!!response.data.error) {
      console.log("Accounting error:", response.data.error);
    } else {
      enableResponseLogging &&
        console.log(
          "Accounting:",
          response?.request?.responseURL?.split(".com")[1],
        );
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
const requestInterceptor = accountingApiClient.interceptors.request.use(
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

interface ZapPayload {
  contentId: string;
  msatAmount: number;
  comment?: string;
  contentTime?: number;
}

export const useWavlakeWalletZap = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) => {
  // const generateZapRequest
  return useMutation({
    mutationFn: async ({
      zapPayload,
      zapRequest,
    }: {
      zapPayload: ZapPayload;
      zapRequest: Event;
    }) => {
      const { data } = await accountingApiClient.post<
        ResponseObject<{ userId: string }>
      >(
        `/send?nostr=${encodeURIComponent(JSON.stringify(zapRequest))}`,
        zapPayload,
      );
      return data.data;
    },
    onSuccess() {
      onSuccess?.();
    },
    onError(response: ResponseObject) {
      onError?.(response.error ?? "Error editing user");
    },
  });
};

export const createReward = async (body: { promoId: number }) => {
  const { data } = await accountingApiClient.post<ResponseObject<Promo>>(
    `/promo/reward`,
    body,
  );
  return data;
};
