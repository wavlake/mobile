import { useLocalSearchParams, useRouter } from "expo-router";
import {
  TouchableWithoutFeedback,
  View,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Button } from "../shared/Button";
import { EventHeader } from "./common";
import { useEffect, useState } from "react";
import { ShowEvents } from "@/constants/events";
import { Picker } from "@react-native-picker/picker";
import { useAuth, useTicketZap, useTickets } from "@/hooks";
import { DialogWrapper } from "../DialogWrapper";
import { useMiniMusicPlayer } from "../MiniMusicPlayerProvider";
import { Center } from "../shared/Center";
import { Text } from "../shared/Text";
import { TextInput } from "../shared/TextInput";

export const EventRSVPPage = () => {
  const { pubkey } = useAuth();
  const { height } = useMiniMusicPlayer();
  const { refetch: refetchTix } = useTickets();
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const event = ShowEvents.find((event) => {
    const [dTag, showDTag] = event.tags.find((tag) => tag[0] === "d") || [];
    return showDTag === eventId;
  });
  const [dTag, showDTag] = event?.tags.find((tag) => tag[0] === "d") || [];
  const { sendZap, isLoading, isPaid } = useTicketZap(showDTag);

  useEffect(() => {
    if (isPaid) {
      // show success dialog
      setTicketSuccess(true);
      refetchTix();
    }
  }, [isPaid]);

  if (!event) {
    return (
      <Center>
        <Text>Event not found</Text>
      </Center>
    );
  }

  const [feeTag, fee] = event.tags.find((tag) => tag[0] === "fee") || [];
  const [titleTag, title] = event.tags.find((tag) => tag[0] === "title") || [];
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [zapAmount, setZapAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const onSubmit = async () => {
    setAmountError("");
    const parsedZapAmount = parseInt(zapAmount);
    const parsedFee = parseInt(fee);
    if (parsedZapAmount < parsedFee) {
      setAmountError(`Must be more than ${fee} sats`);
      return;
    }

    await sendZap({
      amount: parsedZapAmount,
      comment: message,
      quantity,
    });
  };

  if (!pubkey) {
    return (
      <Center>
        <Text>you must login to RSVP to events</Text>
      </Center>
    );
  }

  return (
    <>
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
            <EventHeader />
            <Text style={{ marginBottom: 4, opacity: 0.8 }}>
              This event requires a min of {fee} sats to RSVP, though you're
              free to zap whatever amount you choose. Limit 2 tickets per
              account.
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
                label="amount (sats)"
                value={zapAmount}
                onChangeText={setZapAmount}
                keyboardType="numeric"
                errorMessage={amountError}
              />
              <TextInput
                label="message (optional)"
                value={message}
                onChangeText={setMessage}
                keyboardType="default"
              />
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Button title="Submit" onPress={onSubmit} loading={isLoading}>
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
