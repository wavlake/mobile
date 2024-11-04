import { apiClient } from "./create-api-client";
import { NostrProfileData, ResponseObject } from "./types";

export const updatePubkeyMetadata = async (pubkey?: string | null) => {
  if (!pubkey) return null;
  const { data } = await apiClient.put<ResponseObject<NostrProfileData>>(
    `/accounts/pubkey/${pubkey}`,
    {},
  );
  return data?.data;
};
