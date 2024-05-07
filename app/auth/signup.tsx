import { useState } from "react";
import { useAuth, useCreateNewNostrAccount } from "@/hooks";
import { useUser } from "@/components/UserContextProvider";
import { LoginSignUpForm } from "@/components/LoginSignUpForm";

export default function Signup() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { goToRoot, login } = useAuth();
  const { createUserWithEmail, user, goToWelcome } = useUser();
  const createNewNostrAccount = useCreateNewNostrAccount();

  const handleSignUp = async (email: string, password: string) => {
    setIsLoggingIn(true);
    const result = await createUserWithEmail(email, password);
    // createNewNostrAccount({ name: generateRandomName() });
    // const success = await login(nsec);

    if (result.success) {
      // add an artifical delay to allow time to fetch profile if it's not cached
      setTimeout(async () => {
        await goToRoot();
        setIsLoggingIn(false);
      }, 1000);
    } else {
      setErrorMessage(result.error);
      setIsLoggingIn(false);
    }
  };

  return (
    <LoginSignUpForm
      onSubmit={handleSignUp}
      buttonText="Sign Up"
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
      isLoading={isLoggingIn}
    />
  );
}
