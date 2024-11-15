import { createContext, useContext } from "react";
import { FirebaseUser, UserCredential, firebaseService } from "@/services";
import { NostrProfileData, PrivateUserData } from "@/utils";

export interface CreateEmailUserArgs {
  email: string;
  password: string;
  pubkey: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isRegionVerified: boolean;
}
interface SignedInUser extends UserCredential {
  isRegionVerified?: boolean;
  isEmailVerified?: boolean;
}
export interface UserContextValue {
  user: FirebaseUser | null;
  initializingAuth: boolean;
  catalogUser: PrivateUserData | undefined;
  nostrMetadata: NostrProfileData | undefined;
  refetchUser: () => Promise<any>;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<SignedInUser | { error: string }>;
  signInWithGoogle: () => Promise<SignedInUser | { error: string }>;
  createUserWithEmail: (
    args: CreateEmailUserArgs,
  ) => Promise<SignedInUser | { error: string }>;
}

// Create context with default values
export const UserContext = createContext<
  UserContextValue & typeof firebaseService
>({
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
