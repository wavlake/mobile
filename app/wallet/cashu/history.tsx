import { Text, msatsToSatsWithCommas } from "@/components";
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useToast } from "@/hooks";
import {
  useMintInfo,
  useNutzaps,
  useRedeemedNutzaps,
} from "@/hooks/useCashuPartTwo";

// Define types for our enhanced data
interface CashuProof {
  id: string;
  amount: number;
  secret?: string;
  C?: string;
}

interface TokenEvent {
  id: string;
  mint: string;
  proofs: CashuProof[];
  created_at?: string;
  del?: string[];
}

interface EnhancedTokenEvent extends TokenEvent {
  timestamp: string;
  type: "send" | "receive" | "swap";
  totalAmount: number;
  displayName: string;
}

export default function CashuHistory() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<any>(null);
  const toast = useToast();
  const DEFAULT_MINT_URL = "https://mint.minibits.cash/Bitcoin";

  // Use the new hooks
  const {
    data: nutzaps,
    isLoading: isNutzapsLoading,
    refetch: refetchNutzaps,
  } = useNutzaps();
  const redeemedNutzapsSet = useRedeemedNutzaps();
  const { data: mintInfo, refetch: refetchMintInfo } =
    useMintInfo(DEFAULT_MINT_URL);

  // Placeholder for tokens (would be derived from proofs in actual implementation)
  const [tokens, setTokens] = useState<any[]>([]);
  const isLoading = isNutzapsLoading;

  // Function to refresh wallet data
  const refreshWallet = async () => {
    try {
      await refetchNutzaps();
      await refetchMintInfo();
      // In a real implementation, you would process the nutzaps and calculate proofs here
      // For now we're using mock data
      await fetchMockTokens();
    } catch (error) {
      console.error("Error refreshing wallet:", error);
      toast.show("Failed to refresh transaction history");
    }
  };

  // Mock function to simulate fetching tokens
  // In a real implementation, this would process data from nutzaps and proofs
  const fetchMockTokens = async () => {
    // This is just mock data - replace with actual implementation
    const mockTokens = [
      {
        id: "token1",
        mint: DEFAULT_MINT_URL,
        proofs: [
          { id: "proof1", amount: 500 },
          { id: "proof2", amount: 500 },
        ],
        created_at: new Date().toISOString(),
      },
      {
        id: "token2",
        mint: DEFAULT_MINT_URL,
        proofs: [{ id: "proof3", amount: 1000 }],
        created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        del: ["deleted_proof1"],
      },
    ];

    setTokens(mockTokens);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWallet();
    setRefreshing(false);
  };

  // Process token events into a more UI-friendly format
  const processedEvents = useMemo(() => {
    if (!tokens) return [];

    return tokens
      .map((event) => {
        // Calculate total amount from proofs
        const totalAmount = event.proofs.reduce(
          (sum: any, proof: any) => sum + proof.amount,
          0,
        );

        // Determine transaction type (this is a simplified approach)
        // In a real app, you'd need more context to determine if it's send/receive
        // For now we'll assume events with deleted proofs are sends
        const type = event.del && event.del.length > 0 ? "send" : "receive";

        // Generate a display name
        const displayName =
          type === "send"
            ? `Sent ${msatsToSatsWithCommas(totalAmount)} sats`
            : `Received ${msatsToSatsWithCommas(totalAmount)} sats`;

        return {
          ...event,
          timestamp: event.created_at || new Date().toISOString(), // Fallback if no timestamp
          type,
          totalAmount,
          displayName,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [tokens]);

  // Group processed events by date
  const groupedEvents = useMemo(() => {
    const grouped: any = {};

    processedEvents.forEach((event) => {
      const date = new Date(event.timestamp);
      const dateStr = date.toISOString().split("T")[0];

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(event);
    });

    return grouped;
  }, [processedEvents]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleEventDetails = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const showProofDetails = (proof: any) => {
    Alert.alert(
      "Proof Details",
      `ID: ${proof.id}\nAmount: ${msatsToSatsWithCommas(proof.amount)} sats`,
      [{ text: "OK" }],
    );
  };

  const renderProofItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.proofItem}
      onPress={() => showProofDetails(item)}
    >
      <Text style={styles.proofId} numberOfLines={1} ellipsizeMode="middle">
        {item.id}
      </Text>
      <Text style={styles.proofAmount}>
        {msatsToSatsWithCommas(item.amount)} sats
      </Text>
    </TouchableOpacity>
  );

  const renderTokenEvent = ({ item }: any) => {
    const isExpanded = expandedEvent === item.id;

    return (
      <View style={styles.eventContainer}>
        <TouchableOpacity
          style={styles.eventHeader}
          onPress={() => toggleEventDetails(item.id)}
        >
          <View style={styles.eventIcon}>
            <Ionicons
              name={
                item.type === "send"
                  ? "arrow-up-circle-outline"
                  : "arrow-down-circle-outline"
              }
              size={24}
              color={item.type === "send" ? "#ff4500" : "#4caf50"}
            />
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventType}>
              {item.type === "send" ? "Sent" : "Received"} eCash
            </Text>
            <Text
              style={styles.eventMint}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              Mint: {item.mint}
            </Text>
            <Text style={styles.eventTime}>{formatTime(item.timestamp)}</Text>
          </View>
          <View style={styles.eventAmount}>
            <Text
              style={[
                styles.amountText,
                item.type === "send"
                  ? styles.sentAmount
                  : styles.receivedAmount,
              ]}
            >
              {item.type === "send" ? "-" : "+"}
              {msatsToSatsWithCommas(item.totalAmount)} sats
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#777"
            style={styles.expandIcon}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.expandedTitle}>Transaction Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID:</Text>
              <Text
                style={styles.detailValue}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {item.id}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mint:</Text>
              <Text
                style={styles.detailValue}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {item.mint}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Proofs:</Text>
              <Text style={styles.detailValue}>{item.proofs.length}</Text>
            </View>

            <Text style={styles.proofsTitle}>Proofs</Text>
            <FlatList
              data={item.proofs}
              renderItem={renderProofItem}
              keyExtractor={(proof) => proof.id}
              scrollEnabled={false}
              style={styles.proofsList}
            />
          </View>
        )}
      </View>
    );
  };

  const renderDateSection = ({ item }: any) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>{formatDate(item.date)}</Text>
      <FlatList
        data={item.events}
        renderItem={renderTokenEvent}
        keyExtractor={(event) => event.id}
        scrollEnabled={false}
      />
    </View>
  );

  const getSectionData = () => {
    return Object.keys(groupedEvents)
      .sort((a, b) => b.localeCompare(a)) // Sort dates in descending order
      .map((date) => ({
        date,
        events: groupedEvents[date],
      }));
  };

  // Initialize data on component mount
  useEffect(() => {
    refreshWallet();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>eCash History</Text>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} size="large" />
        ) : processedEvents.length > 0 ? (
          <FlatList
            data={getSectionData()}
            renderItem={renderDateSection}
            keyExtractor={(item) => `date-${item.date}`}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Your eCash transaction history will appear here
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Wallet</Text>
        </TouchableOpacity>
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
  loader: {
    marginTop: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: "#777",
    marginTop: 8,
    textAlign: "center",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 4,
  },
  eventContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    overflow: "hidden",
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
  },
  eventIcon: {
    width: 40,
    alignItems: "center",
  },
  eventDetails: {
    flex: 1,
    marginLeft: 8,
  },
  eventType: {
    fontWeight: "bold",
  },
  eventMint: {
    color: "#555",
    fontSize: 14,
  },
  eventTime: {
    color: "#777",
    fontSize: 12,
    marginTop: 4,
  },
  eventAmount: {
    minWidth: 100,
    alignItems: "flex-end",
  },
  amountText: {
    fontWeight: "bold",
  },
  sentAmount: {
    color: "#ff4500",
  },
  receivedAmount: {
    color: "#4caf50",
  },
  expandIcon: {
    marginLeft: 8,
  },
  expandedContent: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  expandedTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailLabel: {
    width: 60,
    fontWeight: "bold",
  },
  detailValue: {
    flex: 1,
  },
  proofsTitle: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  proofsList: {
    maxHeight: 200,
  },
  proofItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginVertical: 2,
    backgroundColor: "#eef5ff",
    borderRadius: 4,
  },
  proofId: {
    flex: 1,
    marginRight: 8,
    fontSize: 12,
  },
  proofAmount: {
    fontSize: 12,
    fontWeight: "bold",
  },
  backButton: {
    alignItems: "center",
    padding: 16,
    marginTop: 16,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
