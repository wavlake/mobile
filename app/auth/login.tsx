import { useState } from "react";
import { useAuth, useCreateNewNostrAccount } from "@/hooks";
import { useRouter } from "expo-router";
import { generateRandomName } from "@/utils/user";
import { useUser } from "@/components/UserContextProvider";
import { LoginSignUpForm } from "@/components/LoginSignUpForm";

export default function Login() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { signInWithEmail } = useUser();
  const createNewNostrAccount = useCreateNewNostrAccount();

  const handleLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);
    const result = await signInWithEmail(email, password);
    createNewNostrAccount({ name: generateRandomName() });
    // const success = await login(nsec);

    if (result.success) {
      router.replace("/auth/welcome");
    } else {
      setErrorMessage(result.error);
      setIsLoggingIn(false);
    }
  };

  return (
    <LoginSignUpForm
      onSubmit={handleLogin}
      buttonText="Login"
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
      isLoading={isLoggingIn}
    />
  );
}
