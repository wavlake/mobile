import { useState } from "react";
import { useUser } from "@/components/UserContextProvider";
import { LoginSignUpForm } from "@/components/LoginSignUpForm";
import { useRouter } from "expo-router";

export default function Signup() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { createUserWithEmail, user } = useUser();

  const handleSignUp = async (email: string, password: string) => {
    console.log("signing up");
    setIsLoggingIn(true);
    const result = await createUserWithEmail(email, password);

    if ("error" in result) {
      setErrorMessage(result.error);
      setIsLoggingIn(false);
    } else {
      // TODO create a new user in catalog
      router.replace("/auth/welcome");
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
