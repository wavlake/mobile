import { Button, Text, msatsToSatsWithCommas } from "@/components";
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
  Clipboard,
} from "react-native";

export default function SendEcash() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [isSending, setIsSending] = useState(false);
  const mintUrl = "https://mint.minibits.cash/Bitcoin";

  // Use our new hooks
  const { actions: walletActions } = useCashuMint({ mintUrl });
  const {
    proofs,
    totalBalance,
    isLoading,
    actions: proofsActions,
  } = useCashuProofs(mintUrl);

  // Convert sats to msats for compatibility with your UI
  const balance = totalBalance * 1000;

  const handleSend = async () => {
    if (!amount || isNaN(parseInt(amount))) {
      Alert.alert("Invalid Amount", "Please enter a valid amount in sats");
      return;
    }

    const amountInSats = parseInt(amount);
    if (amountInSats <= 0) {
      Alert.alert("Invalid Amount", "Amount must be greater than 0");
      return;
    }

    if (amountInSats > totalBalance) {
      Alert.alert(
        "Insufficient Balance",
        "You don't have enough balance to send this amount",
      );
      return;
    }

    try {
      setIsSending(true);

      // First validate if we have enough tokens
      if (!proofs || proofs.length === 0) {
        throw new Error("No tokens available to spend");
      }

      // Prepare tokens for sending
      const { encodedToken, response } =
        await walletActions.sendTokens.mutateAsync({
          amount: amountInSats,
          proofs,
          options: {
            memo: memo || undefined, // Optional memo if provided
          },
        });

      // Update stored proofs (remove spent ones)
      await proofsActions.updateProofs.mutateAsync(response.keep);

      // TODO: Record transaction history if needed
      // This would be implemented in a separate hook or function

      Alert.alert(
        "Token Created",
        `Token created for ${amountInSats} sats. You can share this token with the receiver.`,
        [
          {
            text: "Copy Token",
            onPress: () => {
              // Copy the token to clipboard
              Clipboard.setString(encodedToken);
              Alert.alert(
                "Copied to Clipboard",
                "Token has been copied to your clipboard",
              );
            },
          },
          {
            text: "Done",
            onPress: () => router.back(),
            style: "default",
          },
        ],
      );
    } catch (error) {
      console.error("Error sending tokens:", error);
      Alert.alert(
        "Error",
        `Failed to create token: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Send eCash</Text>

        <View style={styles.balanceContainer}>
          <Text>Available Balance:</Text>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={styles.balanceText}>
              {typeof balance === "number"
                ? `${msatsToSatsWithCommas(balance)} sats`
                : "0 sats"}
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount (sats)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount in sats"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Memo (optional)</Text>
          <TextInput
            style={styles.input}
            value={memo}
            onChangeText={setMemo}
            placeholder="Add a note"
          />
        </View>

        <View style={styles.actionsContainer}>
          <Button
            width={160}
            color="white"
            onPress={handleSend}
            disabled={isSending || isLoading || !amount}
          >
            {isSending ? <ActivityIndicator color="#fff" /> : "Create Token"}
          </Button>
          <Button
            width={160}
            color="secondary"
            onPress={() => router.back()}
            disabled={isSending}
          >
            Cancel
          </Button>
        </View>
      </View>
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
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  balanceText: {
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
  },
});
