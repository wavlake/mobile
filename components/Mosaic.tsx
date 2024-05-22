import React from "react";
import { View, Image } from "react-native";
import Svg, { Image as SvgImage } from "react-native-svg";
import { LogoIcon } from "./LogoIcon";

const MosaicImage = ({
  imageUrls,
  size = 30,
}: {
  imageUrls: string[];
  size?: number;
}) => {
  // filter out undefined imageUrls to be safe
  const definedImageUrls = imageUrls.filter((url) => url);

  if (definedImageUrls.length === 0) {
    return <LogoIcon fill="white" width={60} height={60} />;
  }

  if (definedImageUrls.length < 4) {
    const [firstImage] = definedImageUrls;
    return (
      <View>
        <Image
          source={{ uri: firstImage }}
          style={{ width: size * 2, height: size * 2 }}
        />
      </View>
    );
  }

  const firstFourImages = definedImageUrls.slice(0, 4);
  return (
    <View>
      <Svg height={size * 2} width={size * 2}>
        {firstFourImages.map((image, index) => (
          <SvgImage
            key={index}
            x={(index % 2) * size}
            y={Math.floor(index / 2) * size}
            width={size}
            height={size}
            href={{ uri: image }}
          />
        ))}
      </Svg>
    </View>
  );
};

export default MosaicImage;
