import React from "react";
import { View, Image } from "react-native";
import Svg, { Image as SvgImage } from "react-native-svg";
import { LogoIcon } from "./LogoIcon";

const imageSize = 30;
const imagesPerRow = 2;

const MosaicImage = ({ imageUrls }: { imageUrls: string[] }) => {
  const images = imageUrls.slice(0, 4);
  const renderMosaic = () => {
    switch (images.length) {
      case 1:
        return (
          <Image
            source={{ uri: images[0] }}
            style={{ width: imageSize * 2, height: imageSize * 2 }}
          />
        );
      case 2:
        return (
          <Svg height={imageSize * 2} width={imageSize * 2}>
            {[...images, ...images].map((image, index) => (
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
        );
      case 3:
        return (
          <Svg height={imageSize * 2} width={imageSize * 2}>
            {[...images, images[0]].map((image, index) => (
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
        );
      case 4:
        return (
          <Svg height={imageSize * 2} width={imageSize * 2}>
            {images.map((image, index) => (
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
        );
      default:
        return <LogoIcon fill="white" width={60} height={60} />;
    }
  };

  return <View>{renderMosaic()}</View>;
};

export default MosaicImage;
