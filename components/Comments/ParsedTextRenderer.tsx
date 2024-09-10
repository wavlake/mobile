import { brandColors } from "@/constants";
import { Image } from "expo-image";
import { Linking, View } from "react-native";
import ParsedText from "react-native-parsed-text";

const handleUrlPress = (url: string) => {
  Linking.openURL(url);
};

const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

const renderImage = (matchingString: string, matches: string[]): any => {
  const urlParamsRemoved = matchingString.replace(/(\?|#)\S*/g, "");

  return (
    <View>
      <Image
        source={{ uri: urlParamsRemoved }}
        placeholder={blurhash}
        style={{ width: 200, height: 200, marginVertical: 10 }}
        cachePolicy="memory-disk"
      />
    </View>
  );
};

export const ParsedTextRender = ({ content }: { content?: string }) => {
  return (
    <ParsedText
      style={{ color: "white" }}
      parse={[
        {
          pattern:
            /\bhttps?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\\\s]*|&[^\\\s]*)*/,
          renderText: renderImage,
        },
        {
          type: "url",
          style: { color: brandColors.purple.DEFAULT },
          onPress: handleUrlPress,
        },
      ]}
    >
      {content}
    </ParsedText>
  );
};
