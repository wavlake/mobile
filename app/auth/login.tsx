import { useState } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@/components/UserContextProvider";
import { LoginSignUpForm } from "@/components/LoginSignUpForm";

export default function Login() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const { signInWithEmail } = useUser();

  const handleLogin = async (email: string, password: string) => {
    const result = await signInWithEmail(email, password);

    if ("error" in result) {
      setErrorMessage(result.error);
    } else {
      router.replace("/auth/welcome");
    }
  };

  return (
    <LoginSignUpForm
      onSubmit={handleLogin}
      buttonText="Login"
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
    />
  );
}
