import { Text, Button, TextInput, Center, LogoIcon } from "@/components";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";

export const LoginSignUpForm = ({
  onSubmit,
  buttonText,
  setErrorMessage,
  errorMessage,
  isLoading,
}: {
  onSubmit: (email: string, password: string) => void;
  buttonText: string;
  setErrorMessage: (message: string) => void;
  errorMessage: string;
  isLoading: boolean;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <Center
        style={{
          paddingHorizontal: 24,
          alignContent: "center",
          paddingVertical: 50,
        }}
      >
        <View style={{ marginVertical: 30 }}>
          <LogoIcon fill="white" width={130} height={108} />
        </View>
        <View
          style={{
            width: "100%",
          }}
        >
          <TextInput
            label="Email"
            autoCorrect={false}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrorMessage("");
            }}
            errorMessage={errorMessage}
          />
          <TextInput
            label="Password"
            secureTextEntry
            autoCorrect={false}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setErrorMessage("");
            }}
            errorMessage={errorMessage}
          />
        </View>
        <Button
          color="white"
          style={{
            marginVertical: 20,
          }}
          onPress={() => onSubmit(email, password)}
          loading={isLoading}
        >
          {buttonText}
        </Button>
        <View
          style={{
            flexGrow: 1,
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <Link href="/auth">
            <Text style={{ fontSize: 18 }} bold>
              Back
            </Text>
          </Link>
        </View>
      </Center>
    </TouchableWithoutFeedback>
  );
};
