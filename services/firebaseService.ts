import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { NativeModules } from "react-native";

export type FirebaseUser = FirebaseAuthTypes.User | null;

const { RNTwitterSignIn } = NativeModules;
// todo - add twitter keys
RNTwitterSignIn.init("TWITTER_CONSUMER_KEY", "TWITTER_CONSUMER_SECRET").then(
  () => console.log("Twitter SDK initialized"),
);

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_FIREBASE_OAUTH_CLIENT_ID,
});

const createUserWithEmail = (email: string, password: string) =>
  auth()
    .createUserWithEmailAndPassword(email, password)
    .catch((error) => {
      return { error: error.code };
    });

const signInWithEmail = (email: string, password: string) =>
  auth()
    .signInWithEmailAndPassword(email, password)
    .catch((error) => {
      return { error: error.code };
    });

const signInAnonymously = () =>
  auth()
    .signInAnonymously()
    .catch((error) => {
      return { error: error.code };
    });

const signOut = () =>
  auth()
    .signOut()
    .catch((error) => {
      return { error: error.code };
    });

const signInWithGoogle = async () => {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices();
  // Get the users ID token
  const { idToken, user } = await GoogleSignin.signIn();
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

const onAuthStateChange = (callback: FirebaseAuthTypes.AuthListenerCallback) =>
  auth().onAuthStateChanged(callback);

export const firebaseService = {
  createUserWithEmail,
  signInWithEmail,
  signInAnonymously,
  signOut,
  signInWithGoogle,
  signInWithTwitter,
  onAuthStateChange,
};
