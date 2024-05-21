import { useEffect, useState } from "react";
import { getFollows } from "@/utils";

// users who the given pubkey follows
export const useNostrFollows = (pubkey?: string | null) => {
  const [followList, setFollowList] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pubkey) {
      setLoading(true);
      getFollows(pubkey)
        .then((event) => {
          if (!event) {
            setLoading(false);
            return;
          }

          const follows = event.tags.filter(([tag]) => tag === "p");
          setFollowList(follows);
          setLoading(false);
        })
        .catch(() => {
          setFollowList(null);
          setLoading(false);
        });
    } else {
      setFollowList(null);
      setLoading(false);
    }
  }, [pubkey]);

  return {
    followList,
    loading,
  };
};

// users who follow the given pubkey
export const useNostrFollowers = (pubkey?: string | null) => {
  const [followerList, setFollowerList] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pubkey) {
      setLoading(true);
      getFollows(pubkey)
        .then((event) => {
          if (!event) {
            setLoading(false);
            return;
          }

          const followers = event.tags.filter(([tag]) => tag === "p");
          setFollowerList(followers);
          setLoading(false);
        })
        .catch(() => {
          setFollowerList(null);
          setLoading(false);
        });
    } else {
      setFollowerList(null);
      setLoading(false);
    }
  }, [pubkey]);

  return {
    followerList,
    loading,
  };
};
