import { brandColors } from "@/constants";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { nip19 } from "nostr-tools";
import { Linking, View } from "react-native";
import ParsedText from "react-native-parsed-text";
import { NostrUserProfile } from "@/utils";
import { useEffect, useMemo, useState } from "react";
import { useNostrEvents } from "@/providers";

interface ParsedTextWrapperProps {
  content?: string;
}

export const ParsedTextWrapper = ({ content = "" }: ParsedTextWrapperProps) => {
  const { batchGetPubkeyProfiles, getPubkeyProfile } = useNostrEvents();
  const [profiles, setProfiles] = useState<Map<string, NostrUserProfile>>(
    new Map(),
  );

  // Extract mentions from the content
  const mentions = useMemo(() => {
    const mentionRegex =
      /nostr:(n(?:profile|pub)1[a-zA-Z0-9]+)(?:@([a-zA-Z0-9_]+))?/g;
    const matches = [...content.matchAll(mentionRegex)];
    return matches
      .map((match) => {
        try {
          const npub = match[1];
          const { type, data } = nip19.decode(npub);
          return {
            pubkey:
              type === "npub" ? data : type === "nprofile" ? data.pubkey : "",
            relays: type === "nprofile" ? data.relays ?? [] : [],
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean) as { pubkey: string; relays: string[] }[];
  }, [content]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const profiles = await batchGetPubkeyProfiles(
        mentions.map((m) => m.pubkey),
      );

      setProfiles(profiles);
    };

    fetchProfiles();
  }, [mentions]);

  return (
    <InternalParsedTextRender
      content={content}
      mentionProfiles={profiles}
      getPubkeyProfile={getPubkeyProfile}
    />
  );
};

const handleUrlPress = (url: string) => {
  Linking.openURL(url);
};

const renderImage = (matchingString: string, matches: string[]): any => {
  const urlParamsRemoved = matchingString.replace(/(\?|#)\S*/g, "");

  return (
    <View style={{ width: "100%" }}>
      <Image
        source={{ uri: urlParamsRemoved }}
        style={{ width: "100%", aspectRatio: 1, marginVertical: 10 }}
        cachePolicy="memory-disk"
        contentFit="cover"
      />
    </View>
  );
};

interface InternalParsedTextRenderProps {
  content?: string;
  mentionProfiles: Map<string, NostrUserProfile>;
  getPubkeyProfile: (pubkey: string) => Promise<NostrUserProfile | null>;
}

const InternalParsedTextRender = ({
  content,
  mentionProfiles,
}: InternalParsedTextRenderProps) => {
  const router = useRouter();
  const basePathname = useGetBasePathname();

  const handleMentionPress = (matchingString: string) => {
    try {
      const npub = matchingString.split(":")[1];
      const { type, data } = nip19.decode(npub);
      const pubkey =
        type === "npub" ? data : type === "nprofile" ? data.pubkey : "";

      if (pubkey) {
        const metadata = mentionProfiles.get(pubkey);
        router.push({
          pathname: `${basePathname}/profile/${pubkey}`,
          params: {
            includeBackButton: "true",
            headerTitle: metadata?.name
              ? `${metadata.name}'s Profile`
              : "Profile",
            includeHeaderTitleVerifiedBadge: "0",
          },
        });
      }
    } catch (e) {
      console.error("Error handling mention press:", e);
    }
  };

  const parseMention = (matchingString: string, matches: string[]) => {
    try {
      const npub = matches[1];
      const { type, data } = nip19.decode(npub);
      const pubkey =
        type === "npub" ? data : type === "nprofile" ? data.pubkey : "";

      if (!pubkey) {
        return matchingString.slice(0, 10);
      }

      const metadata = mentionProfiles.get(pubkey);

      if (metadata) {
        return (
          metadata.displayName ??
          metadata.name ??
          metadata.display_name ??
          pubkey.slice(0, 10)
        );
      }

      return pubkey.slice(0, 10);
    } catch (e) {
      console.error("Error parsing mention:", e);
      return matchingString.slice(0, 10);
    }
  };

  return (
    <ParsedText
      style={{ color: "white" }}
      parse={[
        {
          pattern:
            /\bhttps?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\\\s]*|&[^\\\s]*)*/,
          renderText: renderImage,
        },
        // Add new pattern for Fountain.fm links
        {
          pattern: /\n*https:\/\/fountain\.fm\/track\/[a-zA-Z0-9]+\n*/,
          style: {
            color: brandColors.purple.DEFAULT,
          },
          renderText: () => "",
        },

        {
          pattern: /\n*https:\/\/wavlake\.com\/track\/[a-f0-9\-]{36}/,
          style: {
            color: brandColors.purple.DEFAULT,
          },
          renderText: () => "",
        },
        {
          type: "url",
          style: { color: brandColors.purple.DEFAULT },
          onPress: handleUrlPress,
        },
        {
          pattern: /nostr:(n(?:profile|pub)1[a-zA-Z0-9]+)(?:@([a-zA-Z0-9_]+))?/,
          style: {
            color: brandColors.purple.DEFAULT,
            fontWeight: "600",
          },
          onPress: handleMentionPress,
          renderText: parseMention,
        },
        {
          pattern: /\n*nostr:(n(?:event)1[a-zA-Z0-9]+)(?:@([a-zA-Z0-9_]+))?/,
          style: {
            color: brandColors.purple.DEFAULT,
          },
          renderText: () => "",
        },
      ]}
    >
      {content}
    </ParsedText>
  );
};

export const ParsedTextRender: React.FC<ParsedTextWrapperProps> =
  ParsedTextWrapper;
