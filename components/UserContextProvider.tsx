import React, { useState, useEffect, PropsWithChildren } from "react";
import * as Sentry from "@sentry/react-native";
import { FirebaseUser, firebaseService } from "@/services";
import {
  CreateEmailUserArgs,
  useAuth,
  useCreateNewNostrAccount,
  UserContext,
  useToast,
} from "@/hooks";
import {
  useCreateNewVerifiedUser,
  usePrivateUserData,
} from "@/utils/authTokenApi";
import {
  getKeysFromNostrSecret,
  getSecretFromKeychain,
  saveSecretToKeychain,
  useAddPubkeyToUser,
  useCreateNewUser,
} from "@/utils";

interface AuthState {
  user: FirebaseUser | null;
  initializingAuth: boolean;
}

export const UserContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { mutateAsync: createUser } = useCreateNewUser();
  const { mutateAsync: createVerifiedUser } = useCreateNewVerifiedUser();
  const toast = useToast();
  const { pubkey, login } = useAuth();
  const createNewNostrAccount = useCreateNewNostrAccount();
  const { mutateAsync: addPubkeyToAccount } = useAddPubkeyToUser({});

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    initializingAuth: true,
  });

  const { user, initializingAuth } = authState;
  const { refetch: _refetchUser, data: catalogUser } = usePrivateUserData(
    Boolean(user),
  );

  const refetchUser = async () => {
    if (!user) return;
    return _refetchUser();
  };

  // Nostr account management
  const createNostrAccountForUser = async (username?: string) => {
    const { nsec, pubkey } = await createNewNostrAccount(
      username ? { name: username } : {},
    );

    if (!pubkey || !nsec) {
      toast.show("Failed to create nostr account");
      throw new Error("Failed to create nostr account");
    }

    return { nsec, pubkey };
  };

  const handleExistingNostrAccount = async () => {
    const secret = await getSecretFromKeychain();
    if (!secret?.password) return null;

    await login(secret.password);
    return getKeysFromNostrSecret(secret.password);
  };

  // User creation and association
  const associatePubkeyWithUser = async (keys: any, userEmail: string) => {
    if (!keys?.pubkey || !catalogUser) return false;

    const pubkeyExists = catalogUser.nostrProfileData
      .map((data) => data.publicHex)
      .includes(keys.pubkey);

    if (pubkeyExists) {
      await addPubkeyToAccount();
    }

    return pubkeyExists;
  };

  const handleNewUser = async (email: string, username?: string) => {
    if (!pubkey) {
      const { nsec, pubkey: newPubkey } =
        await createNostrAccountForUser(username);
      saveSecretToKeychain(email, nsec);
      await login(nsec);
      return newPubkey;
    }
    return pubkey;
  };

  // Auth state management
  useEffect(() => {
    const handleAuthStateChange = async (user: FirebaseUser) => {
      setAuthState({ user, initializingAuth: false });

      if (!user) return;

      const { data: incomingCatalogUser } = await _refetchUser();

      if (!incomingCatalogUser?.id) {
        // Wait for DB record creation and retry
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await _refetchUser();
      }
    };

    const unsubscribe = firebaseService.onAuthStateChange(
      handleAuthStateChange,
    );
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const user = await firebaseService.signInWithGoogle();
      if ("error" in user) throw user.error;

      const { data: catalogUserData } = await _refetchUser();

      if (user.additionalUserInfo?.isNewUser) {
        const username = user.user.displayName ?? "";
        const userPubkey = await handleNewUser(user.user.email ?? "", username);
        await createUser({ pubkey: userPubkey, username });
      } else if (!pubkey) {
        const keys = await handleExistingNostrAccount();
        if (keys) {
          await associatePubkeyWithUser(keys, user.user.email ?? "");
        }
      }

      return {
        ...user,
        isRegionVerified: catalogUserData?.isRegionVerified,
        isEmailVerified: user.user.emailVerified,
      };
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          method: "firebase.signInWithGoogle",
        },
      });
      console.error("Google sign-in error:", error);
      return {
        error:
          typeof error === "string" ? error : "Failed to sign in with Google",
      };
    }
  };

  const signInWithApple = async () => {
    try {
      const user = await firebaseService.signInWithApple();
      if ("error" in user) throw user.error;

      const { data: catalogUserData } = await _refetchUser();
      if (user.additionalUserInfo?.isNewUser) {
        const username = user.user.displayName ?? "";
        const userPubkey = await handleNewUser(user.user.email ?? "", username);
        await createUser({ pubkey: userPubkey, username });
      } else if (!pubkey) {
        const keys = await handleExistingNostrAccount();
        if (keys) {
          await associatePubkeyWithUser(keys, user.user.email ?? "");
        }
      }

      return {
        ...user,
        isRegionVerified: catalogUserData?.isRegionVerified,
        isEmailVerified: user.user.emailVerified,
      };
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          method: "firebase.signInWithApple",
        },
      });
      console.error("Apple sign-in error:", error);
      return {
        error:
          typeof error === "string" ? error : "Failed to sign in with Apple",
      };
    }
  };

  const createUserWithEmail = async ({
    email,
    password,
    username,
    firstName,
    lastName,
    pubkey,
    isRegionVerified,
  }: CreateEmailUserArgs) => {
    try {
      const user = await firebaseService.createUserWithEmailFirebase(
        email,
        password,
      );
      if ("error" in user) throw user.error;

      await user.user.sendEmailVerification();

      const newUser = isRegionVerified
        ? await createVerifiedUser({
            username,
            firstName,
            lastName,
            pubkey,
          })
        : await createUser({ username, pubkey });

      if (!newUser) {
        toast.show("Failed to create user in database");
        throw new Error("Failed to create user in database");
      }

      return user;
    } catch (error) {
      console.error("Email user creation error:", error);
      return {
        error: typeof error === "string" ? error : "Failed to create user",
      };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const user = await firebaseService.signInWithEmail(email, password);
      if ("error" in user) throw user.error;

      const { data: catalogUserData } = await _refetchUser();
      if (!catalogUserData) {
        toast.show("Catalog user not found");
        throw new Error("Catalog user not found");
      }

      if (!pubkey) {
        const keys = await handleExistingNostrAccount();
        if (keys) {
          await associatePubkeyWithUser(keys, email);
        }
      } else {
        await associatePubkeyWithUser({ pubkey }, email);
      }

      return {
        ...user,
        isRegionVerified: catalogUserData?.isRegionVerified,
        isEmailVerified: user.user.emailVerified,
      };
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          method: "firebase.signInWithEmail",
        },
      });
      console.error("Email sign-in error:", error);
      return {
        error: typeof error === "string" ? error : "Failed to sign in",
      };
    }
  };

  const contextValue = {
    initializingAuth,
    user,
    catalogUser: user ? catalogUser : undefined,
    refetchUser,
    nostrMetadata: catalogUser?.nostrProfileData.find(
      (n) => n.publicHex === pubkey,
    ),
    ...firebaseService,
    signInWithApple,
    signInWithGoogle,
    signInWithEmail,
    createUserWithEmail,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
