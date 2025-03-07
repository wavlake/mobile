import { Text } from "../shared/Text";
import {
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useMiniMusicPlayer } from "../MiniMusicPlayerProvider";
import { useState } from "react";
import { DialogWrapper } from "../DialogWrapper";
import { Ticket, useAuth, useTickets } from "@/hooks";
import { brandColors } from "@/constants";
import { EventHeader, ItemRow } from "./common";
import { TicketQR } from "./TicketQR";
import { Button } from "../shared/Button";
import { Center } from "../shared/Center";
import { useNostrEvent } from "@/hooks/useNostrEvent";

const Ticketrow = ({
  ticket,
  index,
  ticketList,
}: {
  ticket: Ticket;
  index: number;
  ticketList: Ticket[];
}) => {
  const { data: ticketedEvent } = useNostrEvent(ticket.ticketedEventId);

  const [showQRDialog, setShowQRDialog] = useState(false);
  const { height } = useMiniMusicPlayer();

  // if there is no event, we render some defaults
  const [titleTag, title] = ticketedEvent?.tags.find(
    (tag) => tag[0] === "title",
  ) || ["", `Event not found for id: ${ticket.eventId}`];

  const [startTag, start] =
    ticketedEvent?.tags.find((tag) => tag[0] === "start") || [];
  const [imageTag, image] =
    ticketedEvent?.tags.find((tag) => tag[0] === "image") || [];
  const isLastRow = index === ticketList.length - 1;
  const marginBottom = isLastRow ? height + 16 : 16;
  const onPress = (index: number) => {
    setShowQRDialog(true);
  };

  const timestamp = new Date(parseInt(start) * 1000);
  const formattedDate = timestamp.toLocaleDateString("en-US", {
    weekday: "long",
    // year: "numeric",
    month: "long",
    day: "numeric",
    // hour: "numeric",
    // minute: "numeric",
  });

  return (
    <>
      <DialogWrapper isOpen={showQRDialog} setIsOpen={setShowQRDialog}>
        {ticketedEvent && <EventHeader event={ticketedEvent} />}
        <TicketQR ticket={ticket} />
        <View
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
            }}
          >
            {ticket.secret}
          </Text>
          <Text
            style={{
              fontSize: 20,
            }}
          >
            Quantity: {ticket.quantity}
          </Text>
          <Button onPress={() => setShowQRDialog(false)}>Close</Button>
        </View>
      </DialogWrapper>
      <TouchableOpacity onPress={() => onPress(index)}>
        <ItemRow
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom,
          }}
          title={title}
          image={image}
        >
          <Text
            bold
            numberOfLines={1}
            style={{
              fontSize: 16,
            }}
          >
            {title}
          </Text>
          <Text>{start ? formattedDate : ""}</Text>
          <View
            style={{
              backgroundColor: brandColors.black.DEFAULT,
              borderRadius: 8,
            }}
          >
            <Text
              bold
              style={{
                height: 30,
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {ticket.quantity} {ticket.quantity === 1 ? "ticket" : "tickets"}
            </Text>
          </View>
        </ItemRow>
      </TouchableOpacity>
    </>
  );
};
export const TicketListPage = () => {
  const { tickets, refetch, isLoading } = useTickets();

  const { pubkey } = useAuth();

  if (!pubkey) {
    return (
      <Center>
        <Text>you must login to view your event tickets</Text>
      </Center>
    );
  }

  return (
    <FlatList
      data={tickets}
      renderItem={({ item, index }) => {
        return (
          <Ticketrow
            key={item.id}
            ticket={item}
            index={index}
            ticketList={tickets}
          />
        );
      }}
      ListEmptyComponent={
        isLoading ? null : (
          <Center style={{ marginTop: 20 }}>
            <Text>No tickets yet</Text>
          </Center>
        )
      }
      keyExtractor={(item) => item.id}
      scrollEnabled
      showsHorizontalScrollIndicator={true}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    />
  );
};
