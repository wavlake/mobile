import { View } from "react-native";
import { Text } from "../shared/Text";
import { PulsatingEllipsisLoader } from "../PulsatingEllipsisLoader";
import { BasicAvatar } from "../BasicAvatar";
import { BaseCommentProps } from "./types";

export const CommentMetadata = ({
  npubMetadata,
  metadataIsLoading,
  pubkey,
  closeParent,
}: Omit<BaseCommentProps, "comment"> & { pubkey: string }) => (
  <View style={{ flexDirection: "row", gap: 10 }}>
    <BasicAvatar
      uri={npubMetadata?.picture}
      pubkey={pubkey}
      npubMetadata={npubMetadata}
      isLoading={metadataIsLoading}
      closeParent={closeParent}
    />
    <View>
      {metadataIsLoading ? (
        <PulsatingEllipsisLoader />
      ) : (
        <Text bold>{npubMetadata?.name ?? "anonymous"}</Text>
      )}
    </View>
  </View>
);
