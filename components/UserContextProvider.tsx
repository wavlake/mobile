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
import { PrivateUserData, usePrivateUserData } from "@/utils/catalogApi";

type UserContextProps = {
  user: FirebaseUser;
  initializingAuth: boolean;
  goToWelcome: () => void;
  catalogUser: PrivateUserData | undefined;
} & typeof firebaseService;

const UserContext = createContext<UserContextProps | null>(null);

// this hook manages the user's firebase auth state
export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
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
        console.log("fetching catalog data");
        const { data: incomingCatalogUser } = await refetchUser();
        console.log("incoming catalog user", incomingCatalogUser);
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

  const goToWelcome = () => {
    console.log("go to welcome");
    router.push("/auth/welcome");
  };

  return (
    <UserContext.Provider
      value={{
        initializingAuth,
        user,
        goToWelcome,
        catalogUser,
        ...firebaseService,
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
