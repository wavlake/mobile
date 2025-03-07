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
import { useAuth, useTicketRSVP, useTickets } from "@/hooks";
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
    isZapSuccess,
    lastResult,
    confirmationData,
    handleConfirmation,
  } = useTicketRSVP();

  useEffect(() => {
    if (lastResult?.success && isZapSuccess) {
      // show success dialog
      setTicketSuccess(true);
      refetchTix();
    }
  }, [lastResult, isZapSuccess]);

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

      {/* Payment Confirmation Dialog */}
      <DialogWrapper
        isOpen={confirmationData !== null}
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
            You are about to pay {confirmationData?.amount} sats for{" "}
            {confirmationData?.ticketCount || 1} ticket
            {(confirmationData?.ticketCount || 1) > 1 ? "s" : ""} to event.
          </Text>
          <Text>Recipient: {confirmationData?.recipient}</Text>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <Button
              onPress={() => handleConfirmation(false)}
              style={{ flex: 1, backgroundColor: colors.border }}
            >
              Cancel
            </Button>
            <Button
              onPress={() => handleConfirmation(true)}
              style={{ flex: 1 }}
            >
              Confirm
            </Button>
          </View>
        </View>
      </DialogWrapper>

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
              This event requires a min of {satAmount} sats to RSVP ({fee} USD),
              per ticket.
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
                <Button title="Cancel" onPress={() => router.back()}>
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
