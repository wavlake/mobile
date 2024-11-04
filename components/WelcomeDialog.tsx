import { Link } from "expo-router";
import { DialogWrapper } from "./DialogWrapper";
import { Text } from "./shared/Text";
import { View } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/hooks";
import {
  cacheHasNotSeenWelcomePopup,
  getHasNotSeenWelcomePopup,
} from "@/utils";

export const WelcomeDialog = () => {
  const { catalogUser } = useUser();
  const [shouldShowPopup, setShouldShowPopup] = useState(false);

  const handleClose = useCallback(async () => {
    setShouldShowPopup(false);
    if (catalogUser?.id) {
      await cacheHasNotSeenWelcomePopup(catalogUser.id);
    }
  }, [catalogUser?.id]);

  useEffect(() => {
    const checkWelcomePopupStatus = async () => {
      if (!catalogUser?.id) return;

      const canEarn = catalogUser.emailVerified && catalogUser.isRegionVerified;
      if (!canEarn) return;

      const userHasNotSeenWelcomePopup = await getHasNotSeenWelcomePopup(
        catalogUser.id,
      );

      if (userHasNotSeenWelcomePopup) {
        setShouldShowPopup(true);
      }
    };

    checkWelcomePopupStatus();
  }, [catalogUser?.id]);

  if (!catalogUser) return null;

  return shouldShowPopup ? (
    <DialogWrapper isOpen={true} setIsOpen={handleClose}>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <Text
          bold
          style={{
            fontSize: 18,
          }}
        >
          Listen to earn
        </Text>
        <Text>
          Get started by playing a promoted track to earn sats. Limit of earning
          once per track per day.
        </Text>
        <Link href="/earn" onPress={handleClose}>
          <Text
            bold
            style={{
              textDecorationLine: "underline",
            }}
          >
            Start earning now
          </Text>
        </Link>
      </View>
    </DialogWrapper>
  ) : null;
};
