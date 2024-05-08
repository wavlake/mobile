import { useState } from "react";
import { useUser } from "@/components/UserContextProvider";
import { LoginSignUpForm } from "@/components/LoginSignUpForm";
import { useRouter } from "expo-router";
import { useToast } from "@/hooks";

export default function Signup() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { createUserWithEmail, user } = useUser();
  const { show } = useToast();

  const handleSignUp = async (email: string, password: string) => {
    setIsLoggingIn(true);
    const success = await createUserWithEmail(email, password);

    if (success) {
      router.replace("/auth/welcome");
    } else {
      show("Failed to sign up. Please try again later.");
    }

    setIsLoggingIn(false);
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
