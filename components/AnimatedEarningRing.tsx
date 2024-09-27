import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { SpinningRingImage } from "./AnimatedEarningRingBase64Image";

export const AnimatedEarningRing = ({
  size,
  colors,
}: {
  size: number;
  colors: any;
}) => {
  const adjustedSize = size * 1.2;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = () => {
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        spinValue.setValue(0);
        spin();
      });
    };

    spin();
  }, []);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const centerCircleSize = adjustedSize * 0.5;

  return (
    <View
      style={{
        width: adjustedSize,
        height: adjustedSize,
        position: "absolute",
        zIndex: -1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.Image
        style={{
          width: adjustedSize,
          height: adjustedSize,
          transform: [{ rotate }],
        }}
        source={{ uri: SpinningRingImage }}
      />
      <View
        style={{
          position: "absolute",
          width: centerCircleSize,
          height: centerCircleSize,
          borderRadius: centerCircleSize / 2,
          backgroundColor: "black",
        }}
      />
    </View>
  );
};
