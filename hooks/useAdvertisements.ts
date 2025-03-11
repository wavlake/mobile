import { usePromos } from "./usePromos";
import { useUser } from "./useUser";

export type ImageSource = { uri: string } | number;
export const OLLIE_TOUR_IMAGE: ImageSource = {
  uri: "https://firebasestorage.googleapis.com/v0/b/wavlake-alpha.appspot.com/o/ticket-events%2Follie-tickets.png?alt=media&token=4b3683b8-2755-4453-918b-a4c7f4232b3f",
};

export type Advertisement = {
  eventId?: string;
  href?: string;
  path?: string;
  source: ImageSource;
};

export const useAdvertisements = () => {
  const { catalogUser, initializingAuth } = useUser();
  const { data: promos = [] } = usePromos();

  // TODO: temporarily disabling earn feature
  const userIsEligibleToEarn =
    false &&
    catalogUser?.isRegionVerified &&
    !catalogUser?.isLocked &&
    catalogUser?.emailVerified &&
    !initializingAuth &&
    promos.length > 0;

  const advertisements: Advertisement[] = [
    // ollie events
    {
      path: "/events",
      source: OLLIE_TOUR_IMAGE,
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
