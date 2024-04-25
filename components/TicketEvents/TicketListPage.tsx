import { Text } from "@/components/Text";
import { View, TouchableOpacity, FlatList } from "react-native";
import { useMiniMusicPlayer } from "../MiniMusicPlayerProvider";
import { useState } from "react";
import { DialogWrapper } from "../DialogWrapper";
import { Ticket, useAuth, useTickets } from "@/hooks";
import { ShowEvents } from "@/constants/events";
import { brandColors } from "@/constants";
import { ItemRow } from "./common";
import { Button } from "@rneui/base";

const Ticketrow = ({
  ticket,
  index,
  ticketList,
}: {
  ticket: Ticket;
  index: number;
  ticketList: Ticket[];
}) => {
  const event = ShowEvents.find((event) => {
    const [dTag, id] = event.tags.find((tag) => tag[0] === "d") || [];
    return id === ticket.id;
  });

  const [showQRDialog, setShowQRDialog] = useState(false);

  // if there is no event, we render some defaults
  const [titleTag, title] = event?.tags.find((tag) => tag[0] === "title") || [
    "",
    `Event not found for id: ${ticket.id}`,
  ];

  const [startTag, start] = event?.tags.find((tag) => tag[0] === "start") || [];
  const [imageTag, image] = event?.tags.find((tag) => tag[0] === "image") || [];
  const { height } = useMiniMusicPlayer();
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
        <Text>QR Dialog</Text>
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
  const { tickets } = useTickets();

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
      keyExtractor={(item) => item.id}
      scrollEnabled
      showsHorizontalScrollIndicator={true}
    />
  );
};
