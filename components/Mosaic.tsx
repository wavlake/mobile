import React from "react";
import { View, Image } from "react-native";
import Svg, { Image as SvgImage } from "react-native-svg";
import { LogoIcon } from "./LogoIcon";

const imageSize = 30;

const MosaicImage = ({ imageUrls }: { imageUrls: string[] }) => {
  if (imageUrls.length === 0) {
    return (
      <View>
        <LogoIcon fill="white" width={60} height={60} />;
      </View>
    );
  }

  if (imageUrls.length < 4) {
    const [firstImage] = imageUrls;
    return (
      <View>
        <Image
          source={{ uri: firstImage }}
          style={{ width: imageSize * 2, height: imageSize * 2 }}
        />
      </View>
    );
  }

  const firstFourImages = imageUrls.slice(0, 4);
  return (
    <View>
      <Svg height={imageSize * 2} width={imageSize * 2}>
        {firstFourImages.map((image, index) => (
          <SvgImage
            key={index}
            x={(index % 2) * imageSize}
            y={Math.floor(index / 2) * imageSize}
            width={imageSize}
            height={imageSize}
            href={{ uri: image }}
          />
        ))}
      </Svg>
    </View>
  );
};

export default MosaicImage;
