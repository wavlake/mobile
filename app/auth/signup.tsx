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
    const result = await createUserWithEmail(email, password);

    if ("error" in result) {
      setErrorMessage(result.error);
    } else {
      router.replace("/auth/welcome");
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
