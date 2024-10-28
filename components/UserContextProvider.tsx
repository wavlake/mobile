import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  PropsWithChildren,
} from "react";
import { FirebaseUser, firebaseService, UserCredential } from "@/services";
import { useAuth, useCreateNewNostrAccount } from "@/hooks";
import {
  NostrProfileData,
  PrivateUserData,
  usePrivateUserData,
} from "@/utils/authTokenApi";
import {
  getKeysFromNostrSecret,
  getSecretFromKeychain,
  saveSecretToKeychain,
  useAddPubkeyToUser,
  useCreateNewUser,
} from "@/utils";

interface CreateEmailUserArgs {
  email: string;
  password: string;
  pubkey: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

type SignedInUser = {
  isRegionVerified?: boolean;
  isEmailVerified?: boolean;
} & UserCredential;

type UserContextProps = {
  user: FirebaseUser;
  initializingAuth: boolean;
  catalogUser: PrivateUserData | undefined;
  refetchUser: () => Promise<any>;
  nostrMetadata: NostrProfileData | undefined;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<SignedInUser | { error: string }>;
  signInWithGoogle: () => Promise<SignedInUser | { error: string }>;
  createUserWithEmail: (args: CreateEmailUserArgs) => Promise<
    | SignedInUser
    | {
        error: string;
      }
  >;
} & typeof firebaseService;

const UserContext = createContext<UserContextProps>({
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

// this hook manages the user's firebase auth state
export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const { mutateAsync: createUser } = useCreateNewUser();

  const { pubkey, login } = useAuth();
  const createNewNostrAccount = useCreateNewNostrAccount();
  const { mutateAsync: addPubkeyToAccount } = useAddPubkeyToUser({});

  const [user, setUser] = useState<FirebaseUser>(null);
  const [initializingAuth, setInitializingAuth] = useState(true);

  const enablePrivateUserData = Boolean(user);
  const { refetch: _refetchUser, data: catalogUser } = usePrivateUserData(
    enablePrivateUserData,
  );

  const refetchUser = async () => {
    if (!user) return;
    await _refetchUser();
  };

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChange(async (user) => {
      setUser(user);
      if (initializingAuth) setInitializingAuth(false);

      if (user) {
        const { data: incomingCatalogUser } = await _refetchUser();
        if (!incomingCatalogUser?.id) {
          // if id is not there, we need to refetch again to get the full user data from the db
          // when a new user is signing up, the client creates the firebase user and then makes a call to create the user in the db
          // we need to pause to let the db record be created before we try to fetch it
          await new Promise((resolve) => setTimeout(resolve, 3000));
          await _refetchUser();
        }
      } else {
        // user has signed out, so clear the user data
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const user = await firebaseService.signInWithGoogle();
      if ("error" in user) {
        throw user.error;
      }

      if (user.additionalUserInfo?.isNewUser) {
        if (!pubkey) {
          // create a new nostr account for the new google user
          const username = user.user.displayName;
          const { nsec, pubkey } = await createNewNostrAccount(
            username
              ? {
                  name: username,
                }
              : {},
          );

          if (!pubkey || !nsec) {
            throw "error creating new nostr account";
          }
          saveSecretToKeychain(
            user.user.email ??
              user.additionalUserInfo.username ??
              user.user.displayName ??
              "username",
            nsec,
          );
          await login(nsec);
          // create the wavlake db user using the new firebase userId
          // catalog handles random username generation
          await createUser({ pubkey });
        } else {
          // pubkey is already logged in, so associate it with the new db user
          await createUser({ pubkey });
        }
      } else {
        if (!pubkey) {
          const secret = await getSecretFromKeychain();
          secret?.password && (await login(secret.password));
        }
      }

      const { data: catalogUser } = await _refetchUser();
      const isRegionVerified = catalogUser?.isRegionVerified;

      return {
        ...user,
        isRegionVerified,
        isEmailVerified: user.user.emailVerified,
      };
    } catch (error) {
      console.error("error signing in with google", error);
      return {
        error:
          typeof error === "string" ? error : "Failed to sign in with Google",
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
  }: CreateEmailUserArgs) => {
    try {
      const user = await firebaseService.createUserWithEmailFirebase(
        email,
        password,
      );
      if ("error" in user) {
        throw user.error;
      }

      await user.user.sendEmailVerification();

      // create the wavlake db user using the new firebase userId
      // catalog handles random username generation
      const newUser = await createUser({
        username,
        firstName,
        lastName,
        pubkey,
        // todo - add profile image if available
        // artworkUrl: user.user.photoURL ?? "",
      });

      if (!newUser) {
        throw "error creating user in db";
      }

      if (!pubkey) {
        // new mobile user, so create a new nostr account
        const { nsec, pubkey: newPubkey } = await createNewNostrAccount({
          name: newUser.username,
          // picture: newUser.artworkUrl,
        });

        nsec && (await saveSecretToKeychain(email, nsec));
        nsec && (await login(nsec));
        newPubkey && (await addPubkeyToAccount());
      } else {
        // already logged in mobile user, associate pubkey to the new user
        await addPubkeyToAccount();
      }

      return user;
    } catch (error) {
      console.error("error creating user with email");
      return {
        error: typeof error === "string" ? error : "Failed to create user",
      };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const user = await firebaseService.signInWithEmail(email, password);
      if ("error" in user) {
        throw user.error;
      }

      const { data: catalogUser } = await _refetchUser();
      if (!catalogUser) {
        throw "catalog user not found";
      }

      if (!pubkey) {
        const secret = await getSecretFromKeychain();
        if (secret?.password) {
          await login(secret.password);
          const keys = await getKeysFromNostrSecret(secret.password);

          const pubkeyAssocationExists =
            !!keys?.pubkey &&
            catalogUser?.nostrProfileData
              .map((data) => data.publicHex)
              .includes(keys.pubkey);

          // ensure pubkey association to the user
          pubkeyAssocationExists && (await addPubkeyToAccount());
        }
      } else {
        const pubkeyAssocationExists = catalogUser?.nostrProfileData
          .map((data) => data.publicHex)
          .includes(pubkey);

        // ensure pubkey association to the user
        pubkeyAssocationExists && (await addPubkeyToAccount());
      }

      const isRegionVerified = catalogUser?.isRegionVerified;

      return {
        ...user,
        isRegionVerified,
        isEmailVerified: user.user.emailVerified,
      };
    } catch (error) {
      console.error("error signing in with email", error);
      return { error: typeof error === "string" ? error : "Failed to sign in" };
    }
  };

  return (
    <UserContext.Provider
      value={{
        initializingAuth,
        user,
        catalogUser: user ? catalogUser : undefined,
        refetchUser,
        nostrMetadata: catalogUser?.nostrProfileData.find(
          (n) => n.publicHex === pubkey,
        ),
        ...firebaseService,
        // signInAnonymously: firebaseService.signInAnonymously,
        // signInWithToken: firebaseService.signInWithToken,
        // signOut: firebaseService.signOut,
        // onAuthStateChange: firebaseService.onAuthStateChange,
        // verifyEmailLink: firebaseService.verifyEmailLink,
        // resetPassword: firebaseService.resetPassword,
        // checkIfEmailIsVerified: firebaseService.checkIfEmailIsVerified,
        // resendVerificationEmail: firebaseService.resendVerificationEmail,
        signInWithGoogle,
        signInWithEmail,
        createUserWithEmail,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};
