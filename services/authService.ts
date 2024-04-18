import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { NativeModules } from "react-native";

const { RNTwitterSignIn } = NativeModules;
// todo - add twitter keys
RNTwitterSignIn.init("TWITTER_CONSUMER_KEY", "TWITTER_CONSUMER_SECRET").then(
  () => console.log("Twitter SDK initialized"),
);

GoogleSignin.configure({
  webClientId: process.env.FIREBASE_OAUTH_CLIENT_ID,
});

const signInWithEmail = (email: string, password: string) =>
  auth()
    .createUserWithEmailAndPassword(email, password)
    .then(() => {
      console.log("User account created & signed in!");
    })
    .catch((error) => {
      if (error.code === "auth/email-already-in-use") {
        console.log("That email address is already in use!");
      }

      if (error.code === "auth/invalid-email") {
        console.log("That email address is invalid!");
      }

      console.error(error);
    });

const signInAnonymously = () =>
  auth()
    .signInAnonymously()
    .then(() => {
      console.log("User signed in anonymously");
    })
    .catch((error) => {
      if (error.code === "auth/operation-not-allowed") {
        console.log("Enable anonymous in your firebase console.");
      }

      console.error(error);
    });

const signOut = () =>
  auth()
    .signOut()
    .then(() => console.log("User signed out!"));

const signInWithGoogle = async () => {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // Get the users ID token
  const { idToken } = await GoogleSignin.signIn();

  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  // Sign-in the user with the credential
  return auth().signInWithCredential(googleCredential);
};
const signInWithTwitter = async () => {
  // Perform the login request
  const { authToken, authTokenSecret } = await RNTwitterSignIn.logIn();

  // Create a Twitter credential with the tokens
  const twitterCredential = auth.TwitterAuthProvider.credential(
    authToken,
    authTokenSecret,
  );

  // Sign-in the user with the credential
  return auth().signInWithCredential(twitterCredential);
};

export const authService = {
  signInWithEmail,
  signInAnonymously,
  signOut,
  signInWithGoogle,
  signInWithTwitter,
};
