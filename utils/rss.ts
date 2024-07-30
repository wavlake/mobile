import { v5 } from "uuid";

// these constants are also located in catalog API - services/rss/library/rssUtils.js
const podcastNamespace = "ead4c236-bf58-58c6-a2c6-a6b28d128cb6";
const BASE_URL = "wavlake.com/feed";

const getFeedUrl = (
  contentType: "podcast" | "album" | "artist",
  id: string,
) => {
  switch (contentType) {
    case "podcast":
      return `${BASE_URL}/show/${id}`;
    case "album":
      return `${BASE_URL}/music/${id}`;
    case "artist":
      return `${BASE_URL}/artist/${id}`;
  }
};

export const getPodcastFeedGuid = (
  contentType: "podcast" | "album" | "artist",
  id: string,
) => {
  return v5(getFeedUrl(contentType, id), podcastNamespace);
};
