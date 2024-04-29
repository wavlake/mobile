import { useAuth } from "./useAuth";
import { getSeckey, subscribeToTicket } from "@/utils";
import { useEffect, useState } from "react";
import { nip04 } from "nostr-tools";

export interface Ticket {
  id: string;
  eventId: string;
  quantity: number;
}

const DELIMITER = " | ";

export const useTickets = () => {
  const { pubkey } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchTickets = async () => {
    setIsLoading(true);
    if (!pubkey) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    const ticket = await subscribeToTicket(pubkey);
    if (!ticket) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    const loggedInUserSeckey = await getSeckey();
    const ticketDM = await nip04
      .decrypt(loggedInUserSeckey ?? "", ticket.pubkey, ticket.content)
      .catch((e) => {
        console.error("Error decrypting ticket", e);
        return null;
      });
    if (!ticketDM) return;

    const [
      message,
      title,
      timestamp,
      location,
      ticketId = "failed-to-get-ticket-id",
      quantity = "1",
      eventId = "1",
    ] = ticketDM.split(DELIMITER);
    const newTicket: Ticket = {
      id: ticketId,
      eventId: eventId,
      quantity: parseInt(quantity),
    };
    setTickets([newTicket]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [pubkey]);

  return { tickets, refetch: fetchTickets, isLoading };
};
