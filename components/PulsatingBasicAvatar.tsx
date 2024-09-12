import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

export const PulsatingBasicAvatar = () => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false, // We need to set this to false for color animations
      }),
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]);

    Animated.loop(pulse).start();

    return () => pulseAnim.stopAnimation();
  }, []);

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#111", "#999"], // Change these colors as needed
  });

  return (
    <Animated.View
      style={{
        borderRadius: 100,
        height: 32,
        width: 32,
        backgroundColor,
      }}
    />
  );
};
