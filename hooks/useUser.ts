import { createContext, useContext } from "react";
import { FirebaseUser, firebaseService } from "@/services";
import { NostrProfileData, PrivateUserData } from "@/utils/authTokenApi";

export interface CreateEmailUserArgs {
  email: string;
  password: string;
  pubkey: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export type UserContextProps = {
  user: FirebaseUser;
  initializingAuth: boolean;
  catalogUser: PrivateUserData | undefined;
  refetchUser: () => Promise<any>;
  nostrMetadata: NostrProfileData | undefined;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{
    error?: any;
    userAssociatedPubkey?: string | null;
    isRegionVerified?: boolean;
    isEmailVerified?: boolean;
    createdRandomNpub?: boolean;
  }>;
  signInWithGoogle: () => Promise<{
    error?: any;
    userAssociatedPubkey?: string | null;
    isRegionVerified?: boolean;
    isEmailVerified?: boolean;
    createdRandomNpub?: boolean;
  }>;
  createUserWithEmail: (args: CreateEmailUserArgs) => Promise<any>;
} & typeof firebaseService;

export const UserContext = createContext<UserContextProps>({
  user: null,
  initializingAuth: true,
  catalogUser: undefined,
  nostrMetadata: undefined,
  refetchUser: async () => {},
  ...firebaseService,
  createUserWithEmail: async () => ({ error: "not initialized" }),
  signInWithGoogle: async () => ({ error: "not initialized" }),
  signInWithEmail: async () => ({ error: "not initialized" }),
});

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};
