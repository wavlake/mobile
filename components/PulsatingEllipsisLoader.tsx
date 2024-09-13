import React, { useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";

export const PulsatingEllipsisLoader = () => {
  const opacityDot1 = new Animated.Value(0.3);
  const opacityDot2 = new Animated.Value(0.3);
  const opacityDot3 = new Animated.Value(0.3);

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 600,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        {
          iterations: 10,
        },
      ).start();
    };

    animateDot(opacityDot1, 0);
    animateDot(opacityDot2, 200);
    animateDot(opacityDot3, 400);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.dot, { opacity: opacityDot1 }]}>
        •
      </Animated.Text>
      <Animated.Text style={[styles.dot, { opacity: opacityDot2 }]}>
        •
      </Animated.Text>
      <Animated.Text style={[styles.dot, { opacity: opacityDot3 }]}>
        •
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    fontSize: 16,
    color: "white",
  },
});
