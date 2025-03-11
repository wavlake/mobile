import { useLocalSearchParams, useRouter } from "expo-router";
import {
  TouchableWithoutFeedback,
  View,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Button } from "../shared/Button";
import { EventHeader } from "./common";
import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import {
  ZapConfirmationData,
  useAuth,
  useSettingsManager,
  useTicketRSVP,
  useTickets,
} from "@/hooks";
import { DialogWrapper } from "../DialogWrapper";
import { useMiniMusicPlayer } from "../MiniMusicPlayerProvider";
import { Center } from "../shared/Center";
import { Text } from "../shared/Text";
import { TextInput } from "../shared/TextInput";
import { useBitcoinPrice } from "../BitcoinPriceProvider";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { Switch } from "@rneui/themed";
import { brandColors } from "@/constants";
import { useTheme } from "@react-navigation/native";

export const EventRSVPPage = () => {
  const { colors } = useTheme();
  const [publishRSVP, setPublishRSVP] = useState(false);
  const { convertUSDToSats } = useBitcoinPrice();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const { pubkey } = useAuth();
  const { height } = useMiniMusicPlayer();
  const { refetch: refetchTix } = useTickets();
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const { data: event, isLoading: isLoadingTicketEvent } = useNostrEvent(
    eventId as string,
  );
  const [feeTag, fee, unit] =
    event?.tags.find((tag) => tag[0] === "price") || [];
  const satAmount = convertUSDToSats(Number(fee));
  const {
    submitRSVP,
    isSubmitting,
    lastResult,
    zapConfirmationData,
    handleConfirmation,
  } = useTicketRSVP();

  useEffect(() => {
    if (lastResult?.success) {
      // show success dialog
      setTicketSuccess(true);
      refetchTix();
    }
  }, [lastResult]);

  if (!pubkey) {
    return (
      <Center>
        <Text>you must login to RSVP to events</Text>
      </Center>
    );
  }

  if (isLoadingTicketEvent) {
    return (
      <Center>
        <ActivityIndicator />
      </Center>
    );
  }

  if (!event) {
    return (
      <Center>
        <Text>Event not found</Text>
      </Center>
    );
  }

  const [titleTag, title] = event.tags.find((tag) => tag[0] === "title") || [];

  const onSubmit = async () => {
    await submitRSVP({
      calendarEvent: event,
      status: "accepted",
      freeOrBusy: "busy",
      comment: message,
      ticketCount: quantity,
      paymentComment: message,
      publishRSVP,
    });
  };

  return (
    <>
      {/* Success Dialog */}
      <DialogWrapper isOpen={ticketSuccess} setIsOpen={setTicketSuccess}>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <Text>
            Payment successful! You've RSVP'd for {quantity} ticket
            {quantity > 1 ? "s" : ""} to {title}.
          </Text>
          <Text>You can view your ticket details on the ticket tab.</Text>
          <Button
            onPress={() => {
              setTicketSuccess(false);
              router.back();
            }}
          >
            Close
          </Button>
        </View>
      </DialogWrapper>
      <ConfirmPayment
        zapConfirmationData={zapConfirmationData}
        handleConfirmation={handleConfirmation}
      />
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
          behavior="position"
          enabled
          keyboardVerticalOffset={100}
        >
          <ScrollView
            contentContainerStyle={{
              display: "flex",
              flexDirection: "column",
              paddingBottom: height + 16,
            }}
          >
            <EventHeader event={event} />
            <Text style={{ marginBottom: 4, opacity: 0.8 }}>
              Ticket price is approximately {satAmount} sats (${fee} USD) per
              ticket.
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Text style={{ marginBottom: 4 }} bold>
                Quantity
              </Text>
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 8,
                }}
              >
                <Picker
                  selectedValue={quantity}
                  onValueChange={setQuantity}
                  itemStyle={{ height: 120 }}
                >
                  <Picker.Item label="1 ticket" value={1} />
                  <Picker.Item label="2 tickets" value={2} />
                </Picker>
              </View>
              <TextInput
                label="message (optional)"
                value={message}
                onChangeText={setMessage}
                keyboardType="default"
              />
              <View style={{ flexDirection: "row", marginTop: -16 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text bold>Publish RSVP to nostr</Text>
                  <Text>
                    This will publish a public calendar RSVP for the event.
                  </Text>
                </View>
                <Switch
                  value={publishRSVP}
                  onValueChange={setPublishRSVP}
                  color={brandColors.pink.DEFAULT}
                  trackColor={{
                    false: colors.border,
                    true: brandColors.pink.DEFAULT,
                  }}
                  thumbColor={colors.text}
                />
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Button
                  title="Submit"
                  onPress={onSubmit}
                  loading={isSubmitting}
                >
                  Submit
                </Button>
                <Button
                  title="Cancel"
                  color="white"
                  onPress={() => router.back()}
                >
                  Cancel
                </Button>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  );
};

export const ConfirmPayment = ({
  zapConfirmationData,
  handleConfirmation,
}: {
  zapConfirmationData: ZapConfirmationData | null;
  handleConfirmation: (confirmed: boolean) => void;
}) => {
  const { settings } = useSettingsManager();

  const invoiceAmount = zapConfirmationData?.amount ?? 0;
  const { maxNWCPayment, enableNWC } = settings || {
    maxNWCPayment: 0,
    enableNWC: false,
  };

  const showOpenWalletButton =
    maxNWCPayment && enableNWC && invoiceAmount > maxNWCPayment;
  return (
    <DialogWrapper
      isOpen={zapConfirmationData !== null}
      setIsOpen={() => handleConfirmation(false)}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <Text bold style={{ fontSize: 18, textAlign: "center" }}>
          Confirm Payment
        </Text>
        <Text>
          You are about to pay {zapConfirmationData?.amount} sats for{" "}
          {zapConfirmationData?.ticketCount || 1} ticket
          {(zapConfirmationData?.ticketCount || 1) > 1 ? "s" : ""}.
        </Text>
        {showOpenWalletButton && (
          <Text>
            This payment is above your configured budget. Please increase your
            wallet limits in settings, or use an external wallet.
          </Text>
        )}
        <View
          style={{
            flexDirection: "column",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          {showOpenWalletButton ? (
            <Button onPress={() => handleConfirmation(true)}>
              Open in Wallet
            </Button>
          ) : (
            <Button onPress={() => handleConfirmation(true)}>Confirm</Button>
          )}
          <Button onPress={() => handleConfirmation(false)} color="white">
            Cancel
          </Button>
        </View>
      </View>
    </DialogWrapper>
  );
};
