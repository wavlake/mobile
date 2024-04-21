import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  PropsWithChildren,
} from "react";
import { FirebaseUser, firebaseService } from "@/services";
import { useAuth } from "@/hooks";
import { useNavigation, useRouter } from "expo-router";

type UserContextProps = {
  user: FirebaseUser;
  initializingAuth: boolean;
  goToWelcome: () => void;
} & typeof firebaseService;

const UserContext = createContext<UserContextProps | null>(null);

// this hook manages the user's firebase auth state
export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  const { pubkey } = useAuth();
  const [user, setUser] = useState<FirebaseUser>(null);
  const [initializingAuth, setInitializingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChange((user) => {
      console.log("on auth state changed", user);

      setUser(user);
      if (initializingAuth) setInitializingAuth(false);
    });

    return unsubscribe;
  }, []);

  const goToWelcome = () => {
    console.log("go to welcome");
    router.push("/auth/welcome");
  };

  return (
    <UserContext.Provider
      value={{ initializingAuth, user, goToWelcome, ...firebaseService }}
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
