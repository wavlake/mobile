import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  PropsWithChildren,
} from "react";
import { FirebaseUser, firebaseService } from "@/services";
import { useAuth, useCreateNewNostrAccount } from "@/hooks";
import {
  NostrProfileData,
  PrivateUserData,
  usePrivateUserData,
} from "@/utils/authTokenApi";
import { useAddPubkeyToUser, useCreateUser } from "@/utils";

const generateUsername = (name: string, uid: string) => {
  return `${name}_${uid.split("").slice(0, 7).join("")}`;
};

type UserContextProps = {
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
    hasExistingNostrProfile?: boolean;
    isRegionVerified?: boolean;
  }>;
  signInWithGoogle: () => Promise<{
    error?: any;
    hasExistingNostrProfile?: boolean;
    isRegionVerified?: boolean;
  }>;
} & typeof firebaseService;

const UserContext = createContext<UserContextProps>({
  user: null,
  initializingAuth: true,
  catalogUser: undefined,
  nostrMetadata: undefined,
  refetchUser: async () => {},
  ...firebaseService,
  signInWithGoogle: async () => ({ error: "not initialized" }),
  signInWithEmail: async () => ({ error: "not initialized" }),
  createUserWithEmail: async () => ({ error: "not initialized" }),
});

// this hook manages the user's firebase auth state
export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const { mutateAsync: createUser } = useCreateUser({});
  const [catalogUser, setCatalogUser] = useState<PrivateUserData | undefined>(
    undefined,
  );

  const { pubkey, login } = useAuth();
  const createNewNostrAccount = useCreateNewNostrAccount();
  const { mutateAsync: addPubkeyToAccount } = useAddPubkeyToUser({});

  const [user, setUser] = useState<FirebaseUser>(null);
  const [initializingAuth, setInitializingAuth] = useState(true);

  const { refetch: _refetchUser } = usePrivateUserData();

  const refetchUser = async () => {
    const { data: incomingCatalogUser } = await _refetchUser();
    setCatalogUser(incomingCatalogUser);
  };

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChange(async (user) => {
      setUser(user);
      if (initializingAuth) setInitializingAuth(false);

      if (user) {
        const { data: incomingCatalogUser } = await _refetchUser();
        if (incomingCatalogUser?.id) {
          // when a user has just been created in catalog, only the firebase data will come back
          // so we check if the catalog user db info is also present (id comes from the db)
          setCatalogUser(incomingCatalogUser);
        } else {
          // if id is not there, we need to refetch again to get the full user data from the db
          const { data: refetchedCatalogUser } = await _refetchUser();

          setCatalogUser(refetchedCatalogUser);
        }
      } else {
        // user has signed out, so we need to update the user context
        setCatalogUser(undefined);
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

      // name only used if creating a new db user or nostr profile
      const name = generateUsername(
        user.user.email?.split("@")[0] ?? "user",
        user.user.uid,
      );

      if (user.additionalUserInfo?.isNewUser) {
        // create the wavlake db user using the new firebase userId
        await createUser({
          username: name,
          userId: user.user.uid,
          // TODO - add profile image if available
          // artworkUrl: user.user.photoURL ?? "",
        });
      }
      const { data: catalogUser } = await _refetchUser();

      const hasExistingNostrProfile =
        catalogUser?.nostrProfileData.length !== 0;
      if (!pubkey) {
        if (!hasExistingNostrProfile) {
          // new mobile user, so create a new nostr account
          const { nsec, pubkey: newPubkey } = await createNewNostrAccount({
            name,
            // picture: user.user.photoURL ?? "",
          });

          nsec && (await login(nsec));
          newPubkey && (await addPubkeyToAccount());
        } else {
          // user has an npub, so we don't need to create a new one
        }
      } else {
        // mobile user thats already logged in with an nsec, associate the pubkey to the firebase userID
        !catalogUser?.nostrProfileData
          .map((data) => data.publicHex)
          .includes(pubkey) && (await addPubkeyToAccount());
      }
      const isRegionVerified = catalogUser?.isRegionVerified;
      return { ...user, hasExistingNostrProfile, isRegionVerified };
    } catch (error) {
      console.error("error signing in with google", error);
      return {
        error:
          typeof error === "string" ? error : "Failed to sign in with Google",
      };
    }
  };

  const createUserWithEmail = async (email: string, password: string) => {
    try {
      const user = await firebaseService.createUserWithEmail(email, password);
      if ("error" in user) {
        throw user.error;
      }

      const name = generateUsername(
        user.user.email?.split("@")[0] ?? "user",
        user.user.uid,
      );

      // create the wavlake db user using the new firebase userId
      const newUser = await createUser({
        username: name,
        userId: user.user.uid,
        // todo - add profile image if available
        // artworkUrl: user.user.photoURL ?? "",
      });

      if (!newUser) {
        throw "error creating user in db";
      }

      if (!pubkey) {
        // new mobile user, so create a new nostr account
        const { nsec, pubkey: newPubkey } = await createNewNostrAccount({
          name: newUser.name,
          // picture: newUser.artworkUrl,
        });

        nsec && (await login(nsec));
        newPubkey && (await addPubkeyToAccount());
      } else {
        // old mobile user, associate the pubkey to the new firebase userID
        await addPubkeyToAccount();
      }

      return user;
    } catch (error) {
      console.error("error creating user with email");
      return { error };
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

      const hasExistingNostrProfile =
        catalogUser?.nostrProfileData.length !== 0;
      if (!pubkey) {
        if (!hasExistingNostrProfile) {
          // New login (may or may not have an npub yet, so we give them a brand new one)
          // if a user re-logs in to the app via firebase email and has saved their old mobile app's nsec
          // they'll need to manually log in with that by clicking "Nostr user? Click here" on the welcome page
          // and pasting it in the input field (we dont have it saved in the db so we cant log them in automatically)
          const { nsec, pubkey: newPubkey } = await createNewNostrAccount({
            name: catalogUser.name,
            image: catalogUser.artworkUrl,
          });

          nsec && (await login(nsec));
          newPubkey && (await addPubkeyToAccount());
        } else {
          // user has an npub, so we don't need to create a new one
        }
      } else {
        // mobile user thats already logged in with an nsec, associate the pubkey to the firebase userID
        !catalogUser?.nostrProfileData
          .map((data) => data.publicHex)
          .includes(pubkey) && (await addPubkeyToAccount());
      }
      const isRegionVerified = catalogUser?.isRegionVerified;

      return { ...user, hasExistingNostrProfile, isRegionVerified };
    } catch (error) {
      console.error("error signing in with email");
      return { error };
    }
  };

  return (
    <UserContext.Provider
      value={{
        initializingAuth,
        user,
        catalogUser,
        refetchUser,
        nostrMetadata: catalogUser?.nostrProfileData.find(
          (n) => n.publicHex === pubkey,
        ),
        ...firebaseService,
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
