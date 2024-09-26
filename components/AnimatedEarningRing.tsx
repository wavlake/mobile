import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import SpinnerSvg from "./SPINNER.svg";

export const AnimatedEarningRing = ({
  size,
  colors,
}: {
  size: number;
  colors: any;
}) => {
  const adjustedSize = size * 4.7;
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

  const centerCircleSize = adjustedSize * 0.1; // Adjust this value to change the size of the center circle

  return (
    <View
      style={{
        width: adjustedSize,
        height: adjustedSize,
        backgroundColor: "transparent",
        position: "absolute",
        zIndex: -1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <SpinnerSvg width={adjustedSize} height={adjustedSize} />
      </Animated.View>
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
