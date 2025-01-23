import { deleteNwcSecret } from "@/utils";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as Sentry from "@sentry/react-native";
import * as AppleAuthentication from "expo-apple-authentication";

export type FirebaseUser = FirebaseAuthTypes.User | null;
export type UserCredential = FirebaseAuthTypes.UserCredential;

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_FIREBASE_OAUTH_CLIENT_ID,
});

const createUserWithEmailFirebase = (email: string, password: string) =>
  auth()
    .createUserWithEmailAndPassword(email, password)
    .catch((error) => {
      Sentry.captureException(error, {
        extra: {
          method: "firebase.createUserWithEmailFirebase",
        },
      });
      return { error: error.code };
    });

const signInWithEmail = (email: string, password: string) =>
  auth()
    .signInWithEmailAndPassword(email, password)
    .catch((error) => {
      Sentry.captureException(error, {
        extra: {
          method: "firebase.signInWithEmail",
        },
      });
      return { error: error.code };
    });

const signInAnonymously = () =>
  auth()
    .signInAnonymously()
    .catch((error) => {
      Sentry.captureException(error, {
        extra: {
          method: "firebase.signInAnonymously",
        },
      });
      return { error: error.code };
    });

const signInWithToken = (token: string) =>
  auth()
    .signInWithCustomToken(token)
    .then(async (user) => {
      const emailNotVerified = !user.user.emailVerified;
      if (emailNotVerified) {
        await user.user.sendEmailVerification();
      }
      return user;
    })
    .catch((error) => {
      Sentry.captureException(error, {
        extra: {
          method: "firebase.signInWithToken",
        },
      });
      return { error: error.code };
    });

const signOut = async () => {
  const app = await auth();
  // delete wallet connection associated with userid
  const uid = app.currentUser?.uid;
  uid && (await deleteNwcSecret(uid));

  return app.signOut().catch((error) => {
    Sentry.captureException(error, {
      extra: {
        method: "firebase.signOut",
      },
    });
    return { error: error.code };
  });
};

const signInWithGoogle = async () => {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices();
  // Get the users ID token
  const { idToken, user } = await GoogleSignin.signIn();
  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  // Sign-in the user with the credential
  return auth()
    .signInWithCredential(googleCredential)
    .catch((error) => {
      Sentry.captureException(error, {
        extra: {
          method: "firebase.signInWithGoogle",
        },
      });
      return { error: error.code };
    });
};

const signInWithApple = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Create a Firebase credential from the response
    const appleCredential = auth.AppleAuthProvider.credential(
      credential.identityToken,
    );

    // Sign the user in with the credential
    return auth()
      .signInWithCredential(appleCredential)
      .catch((error) => {
        console.log({ error });
        Sentry.captureException(error, {
          extra: {
            method: "firebase.signInWithApple",
          },
        });
        return { error: error.code };
      });
  } catch (e: any) {
    if (e.code === "ERR_REQUEST_CANCELED") {
      // show("Apple Sign-In was canceled");
    } else {
      // show("Apple Sign-In failed");
      console.error(e);
    }
    return { success: false, error: "Failed to sign in apple user" };
  }
};

// todo - add twitter implementation
// RNTwitterSignIn.init("TWITTER_CONSUMER_KEY", "TWITTER_CONSUMER_SECRET").then(
//   () => console.log("Twitter SDK initialized"),
// );
// const signInWithTwitter = async () => {
//   // Perform the login request
//   const { authToken, authTokenSecret } = await RNTwitterSignIn.logIn();

//   // Create a Twitter credential with the tokens
//   const twitterCredential = auth.TwitterAuthProvider.credential(
//     authToken,
//     authTokenSecret,
//   );

//   // Sign-in the user with the credential
//   return auth()
//     .signInWithCredential(twitterCredential)
//     .catch((error) => {
//       return { error: error.code };
//     });
// };

const onAuthStateChange = (callback: FirebaseAuthTypes.AuthListenerCallback) =>
  auth().onAuthStateChanged(callback);

// https://firebase.google.com/docs/auth/custom-email-handler
const verifyEmailLink = async (url: string) => {
  const urlParams = new URL(url).searchParams;

  // Try to apply the email verification code.
  const actionCode = urlParams.get("oobCode");
  if (!actionCode) {
    return { success: false, error: "Missing action code" };
  }

  return auth()
    .applyActionCode(actionCode)
    .then((res) => {
      // Email address has been verified.
      return { success: true };
    })
    .catch((error) => {
      Sentry.captureException(error, {
        extra: {
          method: "firebase.verifyEmailLink",
        },
      });
      // Code is invalid or expired. Ask the user to verify their email address again.
      return { success: false, error: error.code };
    });
};

const resetPassword = async (
  urlParams: URLSearchParams,
  newPassword: string,
) => {
  const oobCode = urlParams.get("oobCode");
  if (typeof oobCode !== "string" || !newPassword)
    return { success: false, error: "Missing oobCode or newPassword" };

  return auth()
    .confirmPasswordReset(oobCode, newPassword)
    .then(() => {
      return { success: true };
    })
    .catch((error) => {
      Sentry.captureException(error, {
        extra: {
          method: "firebase.resetPassword",
        },
      });
      return { success: false, error: error.code };
    });
};

const resendVerificationEmail = async () => {
  const user = auth().currentUser;
  if (!user) {
    console.error("User must be logged in");
    return { success: false, error: "User must be logged in" };
  }

  return user
    .sendEmailVerification()
    .then(() => {
      return { success: true };
    })
    .catch((error) => {
      Sentry.captureException(error, {
        extra: {
          method: "firebase.resendVerificationEmail",
        },
      });
      return { success: false, error: error.code };
    });
};

const checkIfEmailIsVerified = async () => {
  const user = auth().currentUser;

  if (!user) {
    return { success: false, error: "User must be logged in" };
  }

  try {
    // Reload the user to get the most up-to-date data
    await user.reload();

    // Get the fresh user object
    const freshUser = auth().currentUser;

    if (freshUser) {
      return { success: true, isVerified: freshUser.emailVerified };
    } else {
      return { success: false, error: "Failed to get updated user data" };
    }
  } catch (error) {
    return { success: false, error: "Failed to reload user data" };
  }
};

export const firebaseService = {
  createUserWithEmailFirebase,
  signInWithEmail,
  signInAnonymously,
  signInWithToken,
  signOut,
  signInWithGoogle,
  signInWithApple,
  // signInWithTwitter,
  onAuthStateChange,
  verifyEmailLink,
  resetPassword,
  checkIfEmailIsVerified,
  resendVerificationEmail,
};
