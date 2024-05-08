import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  PropsWithChildren,
} from "react";
import { FirebaseUser, firebaseService } from "@/services";
import { useAuth } from "@/hooks";
import { useRouter } from "expo-router";
import { PrivateUserData, usePrivateUserData } from "@/utils/authTokenApi";
import { useCreateUser } from "@/utils";
import { firebaseJSService } from "@/services/firebaseJSService";

const generateUsername = (name: string, uid: string) => {
  return `${name}_user${uid.split("").slice(0, 7).join("")}`;
};

type UserContextProps = {
  user: FirebaseUser;
  initializingAuth: boolean;
  catalogUser: PrivateUserData | undefined;
  signInWithGoogle: () => Promise<boolean>;
  createUserWithEmail: (email: string, password: string) => Promise<boolean>;
} & Omit<typeof firebaseService, "signInWithGoogle" | "createUserWithEmail"> &
  typeof firebaseJSService;

const UserContext = createContext<UserContextProps | null>(null);

// this hook manages the user's firebase auth state
export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { mutateAsync: createUser } = useCreateUser({});
  const [catalogUser, setCatalogUser] = useState<PrivateUserData | undefined>(
    undefined,
  );

  const { pubkey } = useAuth();
  const [user, setUser] = useState<FirebaseUser>(null);
  const [initializingAuth, setInitializingAuth] = useState(true);

  const {
    isFetching: catalogUserFetching,
    isError: userError,
    refetch: refetchUser,
  } = usePrivateUserData();

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChange(async (user) => {
      console.log("on auth state changed", user);

      setUser(user);
      if (initializingAuth) setInitializingAuth(false);

      if (user) {
        const { data: incomingCatalogUser } = await refetchUser();
        if (incomingCatalogUser?.id) {
          // when a user has just been created in catalog, only the firebase data will come back
          // so we check if the catalog user db info is also present (id comes from the db)
          setCatalogUser(incomingCatalogUser);
        } else {
          // if id is not there, we need to refetch again to get the full user data from the db
          const { data: refetchedCatalogUser } = await refetchUser();

          setCatalogUser(refetchedCatalogUser);
        }
      } else {
        // user has signed out, so we need to update the user context
        setCatalogUser(undefined);
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const user = await firebaseService.signInWithGoogle();
      if (user.additionalUserInfo?.isNewUser) {
        const name = generateUsername(
          user.user.email?.split("@")[0] ?? "user",
          user.user.uid,
        );

        // if new user, create the wavlake user using the new firebase userId
        await createUser({
          username: name,
          userId: user.user.uid,
          // todo - add profile image if available
        });
      }
      return true;
    } catch (error) {
      console.error("error signing in with google", error);
      return false;
    }
  };

  const createUserWithEmail = async (email: string, password: string) => {
    try {
      const user = await firebaseService.createUserWithEmail(email, password);
      if ("error" in user) {
        console.error("error creating firebase user with email", user);
        return false;
      }

      const name = generateUsername(
        user.user.email?.split("@")[0] ?? "user",
        user.user.uid,
      );

      // if new user, create the wavlake user using the new firebase userId
      await createUser({
        username: name,
        userId: user.user.uid,
      });

      return true;
    } catch (e) {
      console.error("error creating user with email", e);
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        initializingAuth,
        user,
        catalogUser,
        ...firebaseService,
        ...firebaseJSService,
        signInWithGoogle,
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
