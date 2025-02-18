import { View } from "react-native";
import { Text } from "../shared/Text";
import { NostrUserProfile } from "@/utils";
import { useContentDetails } from "@/hooks/useContentDetails";
import { PulsatingEllipsisLoader } from "../PulsatingEllipsisLoader";
import MosaicImage from "../Mosaic";

interface AssociatedContentProps {
  contentId: string;
  npubMetadata?: NostrUserProfile | null;
  metadataIsLoading: boolean;
}

export const AssociatedContent = ({
  contentId,
  npubMetadata,
  metadataIsLoading,
}: AssociatedContentProps) => {
  const { data: contentDetails } = useContentDetails(contentId);
  const { metadata: { artwork_url: artworkUrl, title, artist } = {} } =
    contentDetails || {};

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        gap: 10,
      }}
    >
      <MosaicImage imageUrls={[artworkUrl]} />
      <View>
        <View style={{ flexDirection: "row", gap: 4 }}>
          <Text>Comment by</Text>
          {metadataIsLoading ? (
            <PulsatingEllipsisLoader />
          ) : (
            <Text bold>{npubMetadata?.name ?? "anonymous"}</Text>
          )}
        </View>
        <ContentMetadata title={title} artist={artist} />
      </View>
    </View>
  );
};

const ContentMetadata = ({
  title,
  artist,
}: {
  title?: string;
  artist?: string;
}) => {
  if (!title && !artist) return null;

  return (
    <View style={{ width: "100%", flexDirection: "row" }}>
      {title && <Text bold>{title}</Text>}
      {artist && title && <Text> - </Text>}
      {artist && <Text>{artist}</Text>}
    </View>
  );
};
