import { useEffect, useState } from "react";
import { useAuth } from "../useAuth";
import { useNostrFollows } from "./useNostrFollows";

export const useIsPubkeyFollowed = (pubkey: string) => {
  const { pubkey: loggedInUserPubkey, userIsLoggedIn } = useAuth();
  const [isFollowing, setIsFollowing] = useState<boolean>();

  const { data: follows = [], isFetching: isLoadingFollows } =
    useNostrFollows(loggedInUserPubkey);

  useEffect(() => {
    const userIsFollowing = follows.includes(pubkey);
    setIsFollowing(userIsFollowing);
  }, [follows, pubkey]);

  if (!userIsLoggedIn) {
    return {
      isFollowing: false,
      isLoading: false,
    };
  }

  return {
    isFollowing,
    isLoading: isLoadingFollows,
  };
};
