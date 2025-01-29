import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import auth from "@react-native-firebase/auth";
import { Event } from "nostr-tools";
import { Promo } from "./authTokenApi";
import { ResponseObject } from "./types";
import { configureLoggingInterceptors } from "./api-interceptors";

const accountingApi = process.env.EXPO_PUBLIC_WAVLAKE_ACCOUNTING_API_URL;

export const accountingApiClient = axios.create({
  baseURL: accountingApi,
});

configureLoggingInterceptors(accountingApiClient, "Accounting");

// this interceptor adds the auth token
accountingApiClient.interceptors.request.use(async (config) => {
  const currentUser = auth().currentUser;
  if (currentUser && config.headers) {
    const requestAuthToken = await currentUser.getIdToken();
    config.headers.authorization = `Bearer ${requestAuthToken}`;
  }
  return config;
});

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
