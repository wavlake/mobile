import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Circle } from "react-native-svg";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export const AnimatedEarningRing = ({
  size,
  colors,
}: {
  size: number;
  colors: any;
}) => {
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        rotateAnimation.setValue(0);
        startAnimation();
      });
    };

    startAnimation();

    return () => rotateAnimation.stopAnimation();
  }, [rotateAnimation]);

  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const ringSize = size + 20; // 10 units thick on each side
  const circleRadius = ringSize / 2;
  const strokeWidth = 10;

  return (
    <View
      style={{
        position: "absolute",
        transform: [{ translateX: -10 }, { translateY: -10 }, { scale: 0.95 }],
      }}
    >
      <AnimatedSvg
        height={ringSize}
        width={ringSize}
        style={{
          transform: [{ rotate: spin }],
        }}
      >
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="white" stopOpacity="0.1" />
            <Stop offset="0.5" stopColor="pink" stopOpacity="1" />
            <Stop offset="1" stopColor="white" stopOpacity="0.1" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={circleRadius - strokeWidth / 2}
          stroke={colors.background}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={circleRadius - strokeWidth / 2}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      </AnimatedSvg>
    </View>
  );
};
