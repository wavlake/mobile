import { usePromos } from "./usePromos";
import { useUser } from "./useUser";

export type ImageSource = { uri: string } | number;

export type Advertisement = {
  eventId?: string;
  href?: string;
  path?: string;
  source: ImageSource;
};

export const useAdvertisements = () => {
  const { catalogUser, initializingAuth } = useUser();
  const { data: promos = [] } = usePromos();

  const userIsEligibleToEarn =
    catalogUser?.isRegionVerified &&
    !catalogUser?.isLocked &&
    catalogUser?.emailVerified &&
    !initializingAuth &&
    promos.length > 0;

  const advertisements: Advertisement[] = [
    {
      path: "/events",
      source: {
        uri: "https://firebasestorage.googleapis.com/v0/b/wavlake-alpha.appspot.com/o/ticket-events%2Follie-tickets.png?alt=media&token=4b3683b8-2755-4453-918b-a4c7f4232b3f",
      },
    },
    ...(userIsEligibleToEarn
      ? [
          {
            path: "/earn",
            source: require("@/assets/TOPUPMUSIC6.png"),
          },
        ]
      : []),
  ];

  return advertisements;
};
