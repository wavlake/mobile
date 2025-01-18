import { PopupContext, useUser } from "@/hooks";
import React, { useState, useCallback } from "react";
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  getHasNotSeenWelcomePopup,
  cacheHasNotSeenWelcomePopup,
} from "@/utils";
import { WelcomeDialog } from "./WelcomeDialog";

export interface PopupComponentProps {
  onClose: () => void;
}

interface PopupItem {
  id: number;
  Component: React.ComponentType<PopupComponentProps>;
  fadeAnim: Animated.Value;
}

interface PopupProviderProps {
  children: React.ReactNode;
}

interface ShownPopupsState {
  [key: string]: boolean;
}

interface User {
  id: string;
  emailVerified: boolean;
  isRegionVerified: boolean;
}

export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
  const { catalogUser, checkIfEmailIsVerified, refetchUser } = useUser();
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [shownPopups, setShownPopups] = useState<ShownPopupsState>({});

  const userCanEarn = async () => {
    if (!catalogUser) return false;
    const emailVerified = await checkIfEmailIsVerified();
    const freshCatalogUser = await refetchUser();
    if (freshCatalogUser?.isRegionVerified && emailVerified) {
      return true;
    }
  };

  const showPopup = useCallback(
    (Component: React.ComponentType<PopupComponentProps>): number => {
      const id = Date.now();
      const fadeAnim = new Animated.Value(0);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setPopups((current) => [...current, { id, Component, fadeAnim }]);

      return id;
    },
    [catalogUser],
  );

  const hidePopup = useCallback(
    (id: number): void => {
      const popup = popups.find((p) => p.id === id);
      if (!popup) return;

      Animated.timing(popup.fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setPopups((current) => current.filter((popup) => popup.id !== id));
      });
    },
    [popups],
  );

  const showWelcomePopup = useCallback(
    async (user: User) => {
      const popupKey = `welcome-${user.id}`;
      if (shownPopups[popupKey]) return;

      const canEarn = await userCanEarn();
      // only show welcome popup if user can participate in Listen to Earn
      if (!canEarn) return;

      const userHasNotSeenWelcomePopup = await getHasNotSeenWelcomePopup(
        user.id,
      );
      if (!userHasNotSeenWelcomePopup) return;

      setShownPopups((current) => ({
        ...current,
        [popupKey]: true,
      }));

      showPopup(WelcomeDialog);
      cacheHasNotSeenWelcomePopup(user.id);
    },
    [shownPopups, showPopup],
  );

  return (
    <PopupContext.Provider value={{ showWelcomePopup }}>
      {children}
      {popups.map(({ id, Component, fadeAnim }) => (
        <Animated.View
          key={id}
          style={[
            styles.fullScreenOverlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Dimmed backdrop with touch handler */}
          <TouchableWithoutFeedback onPress={() => hidePopup(id)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Popup content */}
          <View style={styles.popupContainer}>
            <TouchableWithoutFeedback>
              <View>
                <Component onClose={() => hidePopup(id)} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </Animated.View>
      ))}
    </PopupContext.Provider>
  );
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background
  },
  popupContainer: {
    position: "absolute",
    top: 250,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 1001, // Higher than backdrop
  },
});
