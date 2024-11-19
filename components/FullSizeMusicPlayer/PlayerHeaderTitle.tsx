import React, { useEffect, useRef, useState } from "react";
import { Animated, TouchableOpacity } from "react-native";
import { useMusicPlayer } from "../MusicPlayerProvider";
import { Text } from "../shared/Text";
import { usePromoCheck } from "@/hooks";
import { State, usePlaybackState } from "react-native-track-player";
import { brandColors } from "@/constants";
import { DialogWrapper } from "../DialogWrapper";
import { AnimatedGlowingBorder } from "./EarningBadge";

const EarnGreen = "#15f38c";

// Helper function to darken a hex color
const darkenColor = (color: string, percent: number) => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return `#${(
    (1 << 24) |
    ((R < 255 ? (R < 1 ? 0 : R) : 255) << 16) |
    ((G < 255 ? (G < 1 ? 0 : G) : 255) << 8) |
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
};

export const PlayerHeaderTitle = () => {
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

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      EarnGreen,
      darkenColor(EarnGreen, 50), // Darken EarnGreen by 20%
    ],
  });

  if (!showEarnings) {
    return <Text>{playerTitle}</Text>;
  }
  const earningActive = isPlaying && canEarnToday;
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
      <TouchableOpacity onPress={onPress}>
        <AnimatedGlowingBorder
          backgroundColor={EarnGreen}
          borderColor={brandColors.beige.dark}
          containerStyle={{ borderRadius: 20 }}
          glowIntensity={0.5}
        >
          <Animated.View
            style={{
              borderRadius: 20,
              backgroundColor: earningActive
                ? backgroundColor
                : brandColors.beige.dark,
              padding: 6,
              width: 200,
            }}
          >
            <Text
              style={{
                width: "100%",
                textAlign: "center",
                color: "black",
              }}
              bold
            >{`${earningVerb} (${earnedToday / 1000}/${
              earnableToday / 1000
            } sats)`}</Text>
          </Animated.View>
        </AnimatedGlowingBorder>
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
