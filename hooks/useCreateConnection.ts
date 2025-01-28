import { catalogApiClient, ResponseObject } from "@/utils";
import { useMutation } from "@tanstack/react-query";

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
