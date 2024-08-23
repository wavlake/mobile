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
      return;
    }
    if (result.hasExistingNostrProfile) {
      router.push({
        pathname: "/auth/nsec-login",
        params: {
          newNpub: result.createdNewNpub ? "true" : "false",
        },
      });
    } else {
      router.replace({
        pathname: result.isRegionVerified ? "/auth/auto-nwc" : "/auth/welcome",
        params: {
          newNpub: result.createdNewNpub ? "true" : "false",
        },
      });
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
