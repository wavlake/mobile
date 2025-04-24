import { Button, Text, msatsToSatsWithCommas } from "@/components";
import { useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCashuMint } from "@/hooks/useCashuMint";
import { useCashuProofs } from "@/hooks/useCashuProofs";

// Storage key for mints
const MINTS_STORAGE_KEY = "cashu-mints";
const DEFAULT_MINT_URL = "https://mint.minibits.cash/Bitcoin";

export default function ManageMints() {
  const router = useRouter();
  const [newMintUrl, setNewMintUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [mints, setMints] = useState<string[]>([]);
  const [activeMint, setActiveMint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mintBalances, setMintBalances] = useState<
    Record<string, number | null>
  >({});

  // We'll use this hook just to access the wallet for each mint
  const { wallet } = useCashuMint({ mintUrl: activeMint || DEFAULT_MINT_URL });

  // Load mints from storage
  const loadMints = useCallback(async () => {
    try {
      const storedMints = await AsyncStorage.getItem(MINTS_STORAGE_KEY);
      const mintsList = storedMints
        ? JSON.parse(storedMints)
        : [DEFAULT_MINT_URL];
      setMints(mintsList);

      // Also get active mint
      const storedActiveMint = await AsyncStorage.getItem("cashu-active-mint");
      setActiveMint(storedActiveMint || mintsList[0] || DEFAULT_MINT_URL);
    } catch (error) {
      console.error("Error loading mints:", error);
      // Fallback to default mint
      setMints([DEFAULT_MINT_URL]);
      setActiveMint(DEFAULT_MINT_URL);
    }
  }, []);

  // Save mints to storage
  const saveMints = async (mintsList: string[]) => {
    try {
      await AsyncStorage.setItem(MINTS_STORAGE_KEY, JSON.stringify(mintsList));
    } catch (error) {
      console.error("Error saving mints:", error);
    }
  };

  // Set active mint
  const setAsActiveMint = async (mintUrl: string) => {
    try {
      await AsyncStorage.setItem("cashu-active-mint", mintUrl);
      setActiveMint(mintUrl);
      Alert.alert("Success", `Set ${mintUrl} as active mint`);
    } catch (error) {
      console.error("Error setting active mint:", error);
      Alert.alert("Error", "Failed to set active mint");
    }
  };

  useEffect(() => {
    loadMints().then(() => {
      loadMintBalances();
    });
  }, [loadMints]);

  const loadMintBalances = async () => {
    if (!mints || mints.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const balances: Record<string, number | null> = {};

      for (const mint of mints) {
        try {
          // For each mint, we create a new hook instance to get the balance
          const { proofs, totalBalance } = useCashuProofs(mint);
          balances[mint] = totalBalance * 1000; // Convert to msats for UI
        } catch (error) {
          console.error(`Error getting balance for mint ${mint}:`, error);
          balances[mint] = null;
        }
      }

      setMintBalances(balances);
    } catch (error) {
      console.error("Error loading mint balances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMint = async () => {
    if (!newMintUrl || newMintUrl.trim() === "") {
      Alert.alert("Invalid URL", "Please enter a valid mint URL");
      return;
    }

    // Basic URL validation
    if (!newMintUrl.startsWith("http")) {
      Alert.alert(
        "Invalid URL",
        "Please enter a valid URL starting with http:// or https://",
      );
      return;
    }

    try {
      setIsAdding(true);

      // Check if mint already exists
      if (mints.includes(newMintUrl.trim())) {
        Alert.alert("Mint exists", "This mint is already added");
        setIsAdding(false);
        return;
      }

      // Try to validate mint by creating a wallet instance
      // const testWallet = new useCashuMint({ mintUrl: newMintUrl.trim() });

      // Add mint to list and save
      const updatedMints = [...mints, newMintUrl.trim()];
      setMints(updatedMints);
      await saveMints(updatedMints);

      setNewMintUrl("");
      loadMintBalances();
      Alert.alert("Success", "Mint added successfully");
    } catch (error) {
      console.error("Error adding mint:", error);
      Alert.alert(
        "Error",
        "Failed to add mint. Please check if the URL is correct and the mint is online.",
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMint = async (mintUrl: string) => {
    Alert.alert(
      "Remove Mint",
      "Are you sure you want to remove this mint? Any balance on this mint will be inaccessible until you add it back.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              // Check if it's the active mint
              if (activeMint === mintUrl) {
                // Find alternative mint to set as active
                const remainingMints = mints.filter((m) => m !== mintUrl);
                if (remainingMints.length > 0) {
                  await setAsActiveMint(remainingMints[0]);
                } else {
                  // If no mints left, set default
                  await setAsActiveMint(DEFAULT_MINT_URL);
                }
              }

              // Remove from list and save
              const updatedMints = mints.filter((m) => m !== mintUrl);
              setMints(updatedMints);
              await saveMints(updatedMints);

              loadMintBalances();
              Alert.alert("Success", "Mint removed successfully");
            } catch (error) {
              console.error("Error removing mint:", error);
              Alert.alert("Error", "Failed to remove mint. Please try again.");
            }
          },
        },
      ],
    );
  };

  const renderMintItem = ({ item }: { item: string }) => (
    <View style={styles.mintItem}>
      <TouchableOpacity
        style={[styles.mintInfo, item === activeMint && styles.activeMint]}
        onPress={() => setAsActiveMint(item)}
      >
        <Text style={styles.mintUrl} numberOfLines={1} ellipsizeMode="middle">
          {item}
          {item === activeMint && (
            <Text style={styles.activeText}> (Active)</Text>
          )}
        </Text>
        <View style={styles.mintBalance}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : mintBalances[item] !== undefined ? (
            <Text>
              {mintBalances[item] !== null
                ? `${msatsToSatsWithCommas(mintBalances[item])} sats`
                : "Error"}
            </Text>
          ) : (
            <Text>--</Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveMint(item)}
      >
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  const refreshWallet = async () => {
    setIsLoading(true);
    await loadMints();
    await loadMintBalances();
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Manage Mints</Text>

        <View style={styles.addMintContainer}>
          <TextInput
            style={styles.input}
            value={newMintUrl}
            onChangeText={setNewMintUrl}
            placeholder="Enter mint URL"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button
            onPress={handleAddMint}
            disabled={isAdding || !newMintUrl}
            color="white"
          >
            {isAdding ? <ActivityIndicator color="#fff" /> : "Add Mint"}
          </Button>
        </View>

        <Text style={styles.sectionTitle}>Your Mints</Text>
        <Text style={styles.sectionSubtitle}>Tap a mint to set as active</Text>

        {isLoading && (!mints || mints.length === 0) ? (
          <ActivityIndicator style={styles.loader} />
        ) : mints && mints.length > 0 ? (
          <FlatList
            data={mints}
            renderItem={renderMintItem}
            keyExtractor={(item, index) => `mint-${index}`}
            style={styles.mintsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text>No mints added yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add a mint URL above to get started
            </Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About Mints</Text>
          <Text style={styles.infoText}>
            Mints are servers that issue eCash tokens. You need to add at least
            one mint to use eCash features. The active mint will be used for all
            eCash operations.
          </Text>
        </View>

        <Button color="secondary" onPress={() => router.back()}>
          Done
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  addMintContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  loader: {
    marginTop: 24,
  },
  mintsList: {
    marginBottom: 16,
  },
  mintItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  mintInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 4,
  },
  activeMint: {
    backgroundColor: "#f0f8ff",
  },
  activeText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  mintUrl: {
    flex: 1,
    marginRight: 8,
  },
  mintBalance: {
    minWidth: 80,
  },
  removeButton: {
    marginLeft: 12,
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
  },
  emptyStateSubtext: {
    color: "#777",
    marginTop: 8,
  },
  infoContainer: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
  },
});
