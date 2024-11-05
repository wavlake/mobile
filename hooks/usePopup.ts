import { createContext, useContext } from "react";

interface User {
  id: string;
  emailVerified: boolean;
  isRegionVerified: boolean;
}

export interface PopupContextValue {
  showWelcomePopup: (user: User) => Promise<void>;
}

export const PopupContext = createContext<PopupContextValue | null>(null);

export const usePopup = (): PopupContextValue => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
};
