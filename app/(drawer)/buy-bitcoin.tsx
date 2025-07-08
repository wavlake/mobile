import React from "react";
import {
  SafeAreaView,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text, Button, ZBDPayWidget } from "@/components";
import { useRouter } from "expo-router";
import { useZBDPay } from "@/hooks";
import { brandColors } from "@/constants";

export default function BuyBitcoin() {
  const router = useRouter();
  const {
    createSession,
    clearSession,
    session,
    isSessionValid,
    remainingTime,
    isCreating,
    isLoading,
    createError,
    sessionError,
    isReady,
    isExpired,
    isCompleted,
    isFailed,
  } = useZBDPay();

  const initializeSession = async () => {
    try {
      await createSession({
        // You can add optional parameters here
        // amount: 50, // Default amount in USD
        // currency: "USD",
      });
    } catch (error) {
      console.error("Error initializing ZBD Pay session:", error);
      Alert.alert(
        "Error",
        "Failed to initialize Bitcoin purchase. Please try again."
      );
    }
  };

  const handleSuccess = (data: any) => {
    console.log("ZBD Pay purchase successful:", data);
    Alert.alert(
      "Purchase Successful!",
      "Your Bitcoin purchase has been completed successfully.",
      [
        {
          text: "OK",
          onPress: () => {
            clearSession();
            router.back();
          },
        },
      ]
    );
  };

  const handleError = (error: string) => {
    console.error("ZBD Pay error:", error);
    Alert.alert(
      "Purchase Failed",
      error || "An error occurred during the purchase process.",
      [
        {
          text: "Try Again",
          onPress: () => clearSession(),
        },
        {
          text: "Cancel",
          onPress: () => {
            clearSession();
            router.back();
          },
          style: "cancel",
        },
      ]
    );
  };

  const handleClose = () => {
    Alert.alert(
      "Cancel Purchase",
      "Are you sure you want to cancel your Bitcoin purchase?",
      [
        {
          text: "Continue Purchase",
          style: "cancel",
        },
        {
          text: "Cancel",
          onPress: () => {
            clearSession();
            router.back();
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderSessionStatus = () => {
    if (isCompleted) {
      return (
        <View style={{ alignItems: "center", gap: 20 }}>
          <Text style={{ fontSize: 24, color: brandColors.up.DEFAULT }}>
            Purchase Completed!
          </Text>
          <Button
            onPress={() => {
              clearSession();
              router.back();
            }}
            color="green"
            width={200}
          >
            Done
          </Button>
        </View>
      );
    }

    if (isFailed) {
      return (
        <View style={{ alignItems: "center", gap: 20 }}>
          <Text style={{ fontSize: 24, color: brandColors.pink.DEFAULT }}>
            Purchase Failed
          </Text>
          <Button
            onPress={() => clearSession()}
            color="orange"
            width={200}
          >
            Try Again
          </Button>
        </View>
      );
    }

    if (isExpired) {
      return (
        <View style={{ alignItems: "center", gap: 20 }}>
          <Text style={{ fontSize: 24, color: brandColors.orange.DEFAULT }}>
            Session Expired
          </Text>
          <Text style={{ fontSize: 16, color: brandColors.black.light }}>
            Your session has expired. Please start a new purchase.
          </Text>
          <Button
            onPress={() => clearSession()}
            color="orange"
            width={200}
          >
            Start New Purchase
          </Button>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brandColors.black.DEFAULT }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        {!session ? (
          <View
            style={{
              alignItems: "center",
              gap: 30,
            }}
          >
            <View style={{ alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 28, textAlign: "center" }}>
                Buy Bitcoin
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  textAlign: "center",
                  color: brandColors.black.light,
                  lineHeight: 24,
                }}
              >
                Purchase Bitcoin securely using fiat currency.{"\n"}
                Powered by ZBD Pay.
              </Text>
            </View>

            {createError && (
              <View style={{ alignItems: "center", gap: 10 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: brandColors.pink.DEFAULT,
                    textAlign: "center",
                  }}
                >
                  {createError.message}
                </Text>
                {createError.message.includes("not yet available") && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: brandColors.black.light,
                      textAlign: "center",
                    }}
                  >
                    The backend API is being deployed. Please try again later.
                  </Text>
                )}
              </View>
            )}

            {isCreating ? (
              <ActivityIndicator 
                size="large" 
                color={brandColors.orange.DEFAULT} 
              />
            ) : (
              <Button
                onPress={initializeSession}
                color="orange"
                width={200}
              >
                Get Started
              </Button>
            )}
          </View>
        ) : isReady ? (
          <View style={{ flex: 1, width: "100%" }}>
            {remainingTime > 0 && (
              <View style={{ padding: 10, alignItems: "center" }}>
                <Text style={{ fontSize: 14, color: brandColors.black.light }}>
                  Session expires in {remainingTime} minutes
                </Text>
              </View>
            )}
            
            <ZBDPayWidget
              widgetUrl={session.widgetUrl}
              onSuccess={handleSuccess}
              onError={handleError}
              onClose={handleClose}
            />
          </View>
        ) : (
          <View style={{ alignItems: "center", gap: 20 }}>
            {renderSessionStatus()}
            
            {isLoading && (
              <ActivityIndicator 
                size="large" 
                color={brandColors.orange.DEFAULT} 
              />
            )}
            
            {sessionError && (
              <Text
                style={{
                  fontSize: 14,
                  color: brandColors.pink.DEFAULT,
                  textAlign: "center",
                }}
              >
                {sessionError.message}
              </Text>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}