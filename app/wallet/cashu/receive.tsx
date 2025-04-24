import { Button, Text } from "@/components";
import { useCashuMint } from "@/hooks/useCashuMint";
import { useCashuProofs } from "@/hooks/useCashuProofs";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  View,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

export default function ReceiveEcash() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const mintUrl = "https://mint.minibits.cash/Bitcoin";

  // Use our new hooks
  const { actions: walletActions } = useCashuMint({ mintUrl });
  const { actions: proofsActions } = useCashuProofs(mintUrl);

  const handleReceive = async () => {
    if (!token || token.trim() === "") {
      Alert.alert("Invalid Token", "Please enter a valid token");
      return;
    }

    try {
      setIsProcessing(true);

      // Receive the tokens using the new hook
      const receivedProofs = await walletActions.receiveTokens.mutateAsync({
        encodedToken: token,
      });

      if (receivedProofs && receivedProofs.length > 0) {
        // Calculate the total amount received
        const totalReceived = walletActions.getProofsTotal(receivedProofs);

        // Save the proofs to storage
        await proofsActions.saveProofs.mutateAsync(receivedProofs);

        // Display success message
        Alert.alert("Success", `Successfully claimed ${totalReceived} sats`, [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);

        // TODO: Record transaction history if needed
        // This would be implemented in a separate hook or function
      } else {
        Alert.alert(
          "Claim Failed",
          "Failed to claim the tokens. They may have already been claimed.",
        );
      }
    } catch (error) {
      console.error("Error receiving tokens:", error);
      Alert.alert(
        "Error",
        `Failed to process token: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <Text style={styles.title}>Receive eCash</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Paste Token</Text>
            <TextInput
              style={styles.tokenInput}
              value={token}
              onChangeText={setToken}
              placeholder="Paste the eCash token here"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              eCash tokens can be received without an internet connection and
              claimed later when you're online.
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <Button
              width={160}
              color="white"
              onPress={handleReceive}
              disabled={isProcessing || !token}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                "Claim Tokens"
              )}
            </Button>
            <Button
              width={160}
              color="secondary"
              onPress={() => router.back()}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Styles remain the same as your original component
  container: {
    flex: 1,
    padding: 16,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  tokenInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 120,
    color: "#333",
  },
  infoContainer: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
  },
});
