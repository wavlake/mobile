import React, { useEffect, useRef, useState } from "react";
import { Animated, TouchableOpacity, View, StyleSheet } from "react-native";
import { useMusicPlayer } from "../MusicPlayerProvider";
import { Text } from "../shared/Text";
import { usePromoCheck } from "@/hooks";
import { State, usePlaybackState } from "react-native-track-player";
import { DialogWrapper } from "../DialogWrapper";
import LottieView from "lottie-react-native";

// const EarnGreen = "#15f38c";
// Helper function to darken a hex color
// const darkenColor = (color: string, percent: number) => {
//   const num = parseInt(color.replace("#", ""), 16);
//   const amt = Math.round(2.55 * percent);
//   const R = (num >> 16) - amt;
//   const G = ((num >> 8) & 0x00ff) - amt;
//   const B = (num & 0x0000ff) - amt;
//   return `#${(
//     (1 << 24) |
//     ((R < 255 ? (R < 1 ? 0 : R) : 255) << 16) |
//     ((G < 255 ? (G < 1 ? 0 : G) : 255) << 8) |
//     (B < 255 ? (B < 1 ? 0 : B) : 255)
//   )
//     .toString(16)
//     .slice(1)}`;
// };

export const PlayerHeaderTitle = () => {
  const animation = useRef<LottieView>(null);
  const [showPopup, setShowPopup] = useState(false);
  const { activeTrack, playerTitle } = useMusicPlayer();
  const { state: playbackState } = usePlaybackState();
  const promoCheckResult = usePromoCheck(
    activeTrack?.hasPromo && activeTrack.id,
  );

  const {
    promoUser: { canEarnToday, earnedToday, earnableToday },
  } = promoCheckResult?.data || {
    promoUser: {},
  };

  const isPlaying = playbackState === State.Playing;
  const showEarnings =
    typeof earnedToday === "number" && typeof earnableToday === "number";

  // Animation setup
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying && canEarnToday) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [isPlaying, canEarnToday, pulseAnim]);

  const earningActive = isPlaying && canEarnToday;
  // Control Lottie animation based on earningActive state
  useEffect(() => {
    if (animation.current) {
      if (earningActive) {
        animation.current.play();
      } else {
        animation.current.pause();
        // Optional: Reset to first frame when inactive
        animation.current.reset();
      }
    }
  }, [earningActive]);

  // using Lottie animation instead of background color pulse
  // const backgroundColor = pulseAnim.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: [
  //     EarnGreen,
  //     darkenColor(EarnGreen, 50), // Darken EarnGreen by 50%
  //   ],
  // });

  if (!showEarnings) {
    return <Text>{playerTitle}</Text>;
  }

  const earningVerb = earningActive ? "Earning" : "Earned";
  const onPress = () => {
    setShowPopup(true);
  };

  return (
    <>
      <PopUp
        isOpen={showPopup}
        setIsOpen={setShowPopup}
        canEarnToday={canEarnToday}
        earnedToday={earnedToday}
        earnableToday={earnableToday}
      />
      <TouchableOpacity onPress={onPress} style={styles.container}>
        <View style={styles.animationContainer}>
          <View style={styles.lottieWrapper}>
            <LottieView
              ref={animation}
              style={styles.lottieAnimation}
              source={
                earningActive
                  ? require("@/assets/earningBadge.json")
                  : require("@/assets/earningBadgeInactive.json")
              }
              loop={true}
              speed={1.0}
            />
          </View>
          <View style={[styles.textContainer]}>
            <Text style={styles.text} bold>{`${earningVerb} (${
              earnedToday / 1000
            }/${earnableToday / 1000} sats)`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
};

const PopUp = ({
  isOpen,
  setIsOpen,
  canEarnToday,
  earnedToday,
  earnableToday,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  canEarnToday?: boolean;
  earnedToday: number;
  earnableToday: number;
}) => {
  return (
    <DialogWrapper isOpen={isOpen} setIsOpen={setIsOpen}>
      {canEarnToday ? (
        <Text>
          Listen to earn. Every day you can listen to promoted tracks and earn
          10 sats for each ~60 seconds of listening. Today, you have earned{" "}
          {earnedToday / 1000} out of {earnableToday / 1000} sats
        </Text>
      ) : (
        <Text>
          You have reached the maximum amount of sats you can earn today. Come
          back tomorrow to earn more.
        </Text>
      )}
    </DialogWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  animationContainer: {
    width: 220,
    height: 50,
    position: "relative",
  },
  lottieAnimation: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    transform: [{ scale: 0.8 }],
  },
  lottieWrapper: {
    position: "absolute",
    width: 300,
    height: 80,
    left: -40,
    top: -15,
  },
  textContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -100 }, { translateY: -19 }], // Half of width and height to center
    borderRadius: 20,
    padding: 6,
    width: 200,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    width: "100%",
    textAlign: "center",
    color: "black",
  },
});
