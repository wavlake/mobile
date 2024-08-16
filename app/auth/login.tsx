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
      });
    } else {
      // they didnt have an existing nostr profile, so we auto created one and logged them in
      // if they are verified, send them to the add nwc page, otherwise send them to the welcome page
      router.replace({
        pathname: result.isRegionVerified ? "/auth/auto-nwc" : "/auth/welcome",
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
