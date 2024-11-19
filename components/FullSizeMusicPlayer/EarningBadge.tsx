import React, { useEffect } from "react";
import { View, Animated, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface AnimatedGlowingBorderProps {
  children: React.ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  glowIntensity?: number;
  animationDuration?: number;
}

export const AnimatedGlowingBorder: React.FC<AnimatedGlowingBorderProps> = ({
  children,
  backgroundColor = "#292a2e",
  borderColor = "#1976ed",
  containerStyle,
  contentStyle,
  glowIntensity = 1,
  animationDuration = 4000,
}) => {
  // Create animated value for rotation
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    // Create infinite rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }),
    ).start();

    // Cleanup animation on unmount
    return () => {
      rotateAnim.stopAnimation();
    };
  }, [animationDuration]);

  // Create interpolation for full 360 degree rotation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Glow effect layer */}
      <View style={[styles.glowContainer, { opacity: glowIntensity }]}>
        <Animated.View
          style={[
            styles.rotatingGradient,
            {
              transform: [{ rotate }],
            },
          ]}
        >
          <LinearGradient
            colors={["transparent", borderColor, "transparent"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gradient}
          />
        </Animated.View>
      </View>

      {/* Main content container */}
      <View style={[styles.content, { backgroundColor }, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

type StyleSheetType = {
  container: ViewStyle;
  glowContainer: ViewStyle;
  rotatingGradient: ViewStyle;
  gradient: ViewStyle;
  content: ViewStyle;
};

const styles = StyleSheet.create<StyleSheetType>({
  container: {
    width: 200,
    height: 40,
    position: "relative",
  },
  glowContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    borderRadius: 20,
  },
  rotatingGradient: {
    position: "absolute",
    width: 500,
    height: 500,
    top: "50%",
    left: "50%",
    marginLeft: -250,
    marginTop: -250,
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
  content: {
    position: "absolute",
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderRadius: 15,
    overflow: "hidden",
  },
});
