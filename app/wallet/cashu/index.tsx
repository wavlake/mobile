import {
  Button,
  msatsToSatsWithCommas,
  Text,
  DollarAmount,
} from "@/components";
import { useToast } from "@/hooks";
import { useCashu } from "@/hooks/useCashu";
import { useCashuMint } from "@/hooks/useCashuMint";
import {
  useMintInfo,
  useMintKeys,
  useMintList,
  useNutzaps,
  useRedeemedNutzaps,
} from "@/hooks/useCashuPartTwo";
import { useCashuProofs } from "@/hooks/useCashuProofs";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";

export default function CashuWallet() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const DEFAULT_MINT_URL = "https://mint.minibits.cash/Bitcoin";
  const toast = useToast();
  // Use the transformed hooks
  const {
    data: mintInfo,
    isLoading: isMintInfoLoading,
    refetch: refetchMintInfo,
  } = useMintInfo(DEFAULT_MINT_URL);

  const {
    data: mintKeys,
    isLoading: isMintKeysLoading,
    refetch: refetchMintKeys,
  } = useMintKeys(DEFAULT_MINT_URL);

  const {
    data: mintList,
    isLoading: isMintListLoading,
    refetch: refetchMintList,
  } = useMintList();

  const { data: nutzaps } = useNutzaps();
  const redeemedNutzaps = useRedeemedNutzaps();

  const isLoading = isMintInfoLoading || isMintKeysLoading || isMintListLoading;
  const isError = !mintInfo && !isMintInfoLoading;

  // Calculate total balance
  const [totalBalance, setTotalBalance] = useState(0);
  const balance = totalBalance * 1000; // Convert sats to msats for compatibility

  const loadBalanceInfo = async () => {
    try {
      // In a real implementation, you would calculate this based on the actual proofs
      // This is a placeholder that assumes the nutzaps length represents the balance
      // You would need to implement proper balance calculation based on your app's logic
      const mockBalance = nutzaps?.length || 0;
      setTotalBalance(mockBalance);
    } catch (error) {
      console.error("Error loading balance info:", error);
      toast.show("Failed to load balance information");
    }
  };

  // Load balance information
  useEffect(() => {
    loadBalanceInfo();
  }, [mintInfo, mintKeys, nutzaps]);

  const refreshWallet = async () => {
    try {
      await refetchMintInfo();
      await refetchMintKeys();
      await refetchMintList();
      await loadBalanceInfo();
    } catch (error) {
      console.error("Error refreshing wallet:", error);
      toast.show("Failed to refresh wallet");
    }
  };

  // Helper function to get mint balance - assuming a single mint for now
  const getMintBalance = async (mintUrl: string) => {
    if (mintUrl === DEFAULT_MINT_URL) {
      return totalBalance * 1000; // Convert to msats
    }
    return 0; // If we need to support multiple mints, we'd handle that here
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWallet();
    setRefreshing(false);
  };

  const onSend = () => {
    router.push("/wallet/cashu/send");
  };

  const onReceive = () => {
    router.push("/wallet/cashu/receive");
  };

  const onManageMints = () => {
    router.push("/wallet/cashu/mints");
  };

  const onHistory = () => {
    router.push("/wallet/cashu/history");
  };

  useEffect(() => {
    // Refresh wallet data when component mounts
    refreshWallet();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.balanceContainer}>
          <Text style={styles.title}>eCash Wallet</Text>
          <BalanceInfo
            balance={balance}
            isLoading={isLoading}
            isError={isError}
          />
        </View>

        <View style={styles.actionsContainer}>
          <Button width={160} color="white" onPress={onSend}>
            Send
          </Button>
          <Button width={160} color="white" onPress={onReceive}>
            Receive
          </Button>
        </View>

        {mintInfo && (
          <View style={styles.mintsContainer}>
            <Text style={styles.sectionTitle}>Mints</Text>
            <View style={styles.mintItem}>
              <Text
                style={styles.mintUrl}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {DEFAULT_MINT_URL}
              </Text>
              <MintBalance
                mintUrl={DEFAULT_MINT_URL}
                getMintBalance={getMintBalance}
              />
            </View>
            <TouchableOpacity
              style={styles.manageMints}
              onPress={onManageMints}
            >
              <Text style={styles.linkText}>Manage Mints</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.historyLink} onPress={onHistory}>
          <Text style={styles.linkText}>Transaction History</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const BalanceInfo = ({
  balance,
  isLoading,
  isError,
}: {
  balance: number | null;
  isLoading: boolean;
  isError: boolean;
}) => {
  return (
    <View style={styles.balanceInfo}>
      <View style={styles.balanceAmount}>
        {isLoading ? (
          <ActivityIndicator animating={true} size="small" />
        ) : isError ? (
          <Text style={styles.errorText}>Error loading wallet</Text>
        ) : (
          <Text style={styles.balanceText}>
            {typeof balance === "number"
              ? `${msatsToSatsWithCommas(balance)} sats`
              : "0 sats"}
          </Text>
        )}
      </View>
      <View style={styles.dollarAmount}>
        <DollarAmount sats={balance ? balance / 1000 : 0} />
      </View>
    </View>
  );
};

const MintBalance = ({
  mintUrl,
  getMintBalance,
}: {
  mintUrl: string;
  getMintBalance: (mintUrl: string) => Promise<number>;
}) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const mintBalance = await getMintBalance(mintUrl);
        setBalance(mintBalance);
      } catch (error) {
        console.error("Error fetching mint balance:", error);
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [mintUrl]);

  return (
    <View style={styles.mintBalance}>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : balance !== null ? (
        <Text>{msatsToSatsWithCommas(balance)} sats</Text>
      ) : (
        <Text style={styles.errorText}>Error</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // All styles remain the same as your original component
  container: {
    flexGrow: 1,
    padding: 16,
    gap: 24,
  },
  balanceContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  balanceInfo: {
    alignItems: "center",
  },
  balanceAmount: {
    height: 60,
    justifyContent: "center",
  },
  balanceText: {
    fontSize: 32,
  },
  dollarAmount: {
    height: 40,
  },
  errorText: {
    color: "red",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 16,
  },
  mintsContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  mintItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  mintUrl: {
    flex: 1,
    marginRight: 8,
  },
  mintBalance: {
    minWidth: 80,
    alignItems: "flex-end",
  },
  manageMints: {
    marginTop: 16,
    alignItems: "center",
  },
  historyLink: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    fontSize: 16,
    color: "#007AFF",
  },
  emptyStateContainer: {
    alignItems: "center",
    marginTop: 40,
    gap: 16,
  },
});
