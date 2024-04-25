import { useAuth } from "./useAuth";
import { getSeckey, subscribeToTicket } from "@/utils";
import { useEffect, useState } from "react";
import { nip04 } from "nostr-tools";

export interface Ticket {
  id: string;
  eventId: string;
  quantity: number;
}

export const useTickets = () => {
  const { pubkey = "" } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    (async () => {
      const ticket = await subscribeToTicket(pubkey);
      if (!ticket) return;
      const loggedInUserSeckey = await getSeckey();
      const ticketDM = await nip04
        .decrypt(loggedInUserSeckey ?? "", ticket.pubkey, ticket.content)
        .catch((e) => {
          console.error("Error decrypting ticket", e);
          return null;
        });
      const newTicket: Ticket = {
        id: "static-replace-me",
        eventId: "1",
        quantity: 1,
      };
      setTickets([newTicket]);
    })();
  }, [pubkey]);
  return { tickets };
};
