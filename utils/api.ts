import axios from "axios";
import { getAuthToken, signEvent } from "./nostr";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import auth from "@react-native-firebase/auth";
import { NostrProfileData } from "./authTokenApi";
import { ActivityItem } from "@/components";

// response.data should have this shape
export interface ResponseObject<T = any> {
  error?: string;
  success: boolean;
  data: T;
}
export interface Track {
  id: string;
  title: string;
  artistId: string;
  artist: string;
  artistUrl?: string;
  avatarUrl: string;
  artworkUrl: string;
  albumId: string;
  albumTitle: string;
  liveUrl: string;
  duration: number;
  msatTotal?: number;
  msatTotal30Days?: number;
  podcast?: Podcast;
  podcastUrl?: string;
  podcastId?: string;
  hasPromo?: boolean;
  colorInfo?: {
    darkMuted: string;
    darkVibrant: string;
    lightMuted: string;
    lightVibrant: string;
    muted: string;
    vibrant: string;
  };
  genre?: {
    id: number;
    name: string;
  };
}
export interface Episode {
  id: string;
  title: string;
  description?: string;
  order: number;
  playCount?: number;
  createdAt: string;
  publishedAt: string;
  liveUrl: string;
  duration: number;
  podcastId: string;
  podcast: Podcast | string;
  podcastUrl: string;
  artworkUrl: string;
}

export interface Podcast {
  id: string;
  name: string;
  description?: string;
  artworkUrl: string;
  podcastUrl: string;
}

export interface TrackResponse extends Track {
  [key: string]: unknown;
}

export interface SearchResult {
  id: string;
  type: "artist" | "album" | "track";
  name: string;
  avatarUrl: string;
  artworkUrl?: string;
  liveUrl?: string;
  duration?: number;
  albumId?: string;
  albumTitle?: string;
  artistId?: string;
  artist?: string;
}

export interface ContentComment {
  id: number;
  contentId: string;
  title: string;
  content?: string;
  createdAt: string;
  msatAmount: number;
  userId: string;
  name: string | null;
  commenterArtworkUrl: string | null;
  artworkUrl: string | null;
  isNostr: boolean;
  // this houses legacy comment replies that have no nostr event ids
  replies: ContentComment[];
  // kind 1 event id
  // may not exist, depends on user's preference
  eventId?: string;
  // zap receipt event id
  zapEventId?: string;
}

export interface Artist {
  id: string;
  userId: string;
  name: string;
  artworkUrl: string;
  artistUrl: string;
  createdAt: string;
  updatedAt: string;
  bio: string;
  twitter: string | null;
  instagram: string | null;
  youtube: string | null;
  website: string | null;
  deleted: boolean;
  verified: boolean;
  npub: string | null;
  topAlbums?: Album[];
  topTracks?: TrackResponse[];
  topMessages?: ContentComment[];
}

export interface Album {
  id: string;
  artistId: string;
  artist?: string;
  title: string;
  artworkUrl: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  deleted: boolean;
  genreId: number | null;
  subgenreId: number | null;
  isDraft: boolean;
  publishedAt: string;
  topMessages?: ContentComment[];
}
export interface Playlist {
  id: string;
  userId: string;
  title: string;
  isFavorites: boolean;
  createdAt: string;
  updatedAt: string;
  tracks: Pick<Track, "artworkUrl" | "id" | "duration" | "title" | "artist">[];
}

interface Genre {
  id: number;
  name: string;
  count: number;
}

const baseURL = process.env.EXPO_PUBLIC_WAVLAKE_API_URL;
const enableResponseLogging = Boolean(
  process.env.EXPO_PUBLIC_ENABLE_RESPONSE_LOGGING,
);
const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.response.use(
  (response) => {
    if (!!response.data.error) {
      console.log(
        `Catalog error${
          response.headers["Authorization"] ? " (nostr auth):" : ":"
        }`,
        response.data.error,
      );
    } else {
      enableResponseLogging &&
        console.log(
          `Catalog${
            response.headers["Authorization"] ? " (nostr auth):" : ":"
          }`,
          response?.request?.responseURL?.split(".com")[1],
        );
    }

    return response;
  },
  (error) => {
    if (typeof error.response.data.error === "string") {
      const apiErrorMessage = error.response.data.error;
      return Promise.reject(apiErrorMessage);
    } else {
      console.log("Catalog error:", error);
      console.error(error);
      return Promise.reject("An error occurred");
    }
  },
);

// Function to normalize the response from the API
// TODO: Make responses from API consistent
export const normalizeTrackResponse = (res: TrackResponse[]): Track[] => {
  return res.map((track) => ({
    id: track.id,
    title: track.title,
    artistId: track.artistId,
    artist: track.artist,
    artistUrl: track.artistUrl,
    avatarUrl: track.avatarUrl,
    artworkUrl: track.artworkUrl,
    albumId: track.albumId,
    albumTitle: track.albumTitle,
    liveUrl: track.liveUrl,
    duration: track.duration,
    msatTotal: track.msatTotal,
    hasPromo: track.hasPromo,
    colorInfo: track.colorInfo,
  }));
};

function isPodcastTypeInEpisode(item: any): item is Podcast {
  return !!item.name;
}
// Function to format episodes to fit the Track type
// and work with the rest of the app
const normalilzeEpisodeResponse = (res: TrackResponse[]): Track[] => {
  return res.map((episode) => ({
    id: episode.id,
    title: episode.title,
    artistId: episode.id,
    artist: isPodcastTypeInEpisode(episode.podcast)
      ? episode.podcast.name
      : episode.podcast || "",
    artistUrl: isPodcastTypeInEpisode(episode.podcast)
      ? episode.podcast.podcastUrl
      : episode.podcastUrl,
    avatarUrl: isPodcastTypeInEpisode(episode.podcast)
      ? episode.podcast.artworkUrl
      : episode.artworkUrl,
    artworkUrl: isPodcastTypeInEpisode(episode.podcast)
      ? episode.podcast?.artworkUrl
      : episode.artworkUrl,
    albumId: isPodcastTypeInEpisode(episode.podcast)
      ? episode.podcast.id
      : episode.podcastId || "",
    albumTitle: "podcast",
    liveUrl: episode.liveUrl,
    duration: episode.duration,
    msatTotal: episode.msatTotal30Days || 0,
    hasPromo: episode.hasPromo,
  }));
};

// if the user is logged in, we get the forYou track data
export type HomePageData = {
  featured: Track[];
  newTracks: Track[];
  trending: Track[];
  forYou?: Track[];
};

export const getHomePage = async (): Promise<HomePageData> => {
  const url = "/tracks/featured";
  const { data } = await apiClient.get<
    ResponseObject<{
      featured: TrackResponse[];
      newTracks: TrackResponse[];
      trending: TrackResponse[];
      forYou: TrackResponse[];
    }>
  >(url, {
    headers: {
      Authorization: await createAuthHeader(url),
    },
  });

  return {
    featured: normalizeTrackResponse(data.data.featured),
    newTracks: normalizeTrackResponse(data.data.newTracks),
    trending: normalizeTrackResponse(data.data.trending),
    forYou: normalizeTrackResponse(data.data.forYou),
  };
};

export const getRandomMusic = async (): Promise<Track[]> => {
  const { data } = await apiClient.get("/tracks/random");

  return normalizeTrackResponse(data.data);
};

export const getFeaturedPodcasts = async (): Promise<Track[]> => {
  const { data } = await apiClient.get("/episodes/featured");

  return normalilzeEpisodeResponse(data.data);
};

export const getNewPodcasts = async (): Promise<Track[]> => {
  const { data } = await apiClient.get("/episodes/new");

  return normalilzeEpisodeResponse(data.data);
};

export const search = async (query: string): Promise<SearchResult[]> => {
  const { data } = await apiClient.get("/search", {
    params: {
      term: query,
    },
  });

  return data.data;
};

export const getAlbum = async (albumId: string): Promise<Album> => {
  const { data } = await apiClient.get(`/albums/${albumId}`);

  return data.data;
};

export const getArtistComments = async (
  artistId: string,
  page: number,
  pageSize: number,
): Promise<ContentComment[]> => {
  const { data } = await apiClient.get(
    `/comments/artist/${artistId}/${page}/${pageSize}`,
  );

  return data.data;
};

export const getAlbumTracks = async (albumId: string): Promise<Track[]> => {
  const { data } = await apiClient.get(`/tracks/${albumId}/album`);

  return normalizeTrackResponse(data.data);
};

export const getAlbumComments = async (
  albumId: string,
  page: number,
  pageSize: number,
): Promise<ContentComment[]> => {
  const { data } = await apiClient.get(
    `/comments/album/${albumId}/${page}/${pageSize}`,
  );

  return data.data;
};

export const getArtist = async (artistId: string): Promise<Artist> => {
  const { data } = await apiClient.get(`/artists/${artistId}`);

  return data.data;
};

export const getArtistAlbums = async (artistId: string): Promise<Album[]> => {
  const { data } = await apiClient.get(`/albums/${artistId}/artist`);

  return data.data;
};

export const getArtistTracks = async (artistId: string): Promise<Track[]> => {
  const { data } = await apiClient.get(`/tracks/${artistId}/artist`);

  return normalizeTrackResponse(data.data);
};

export const getPodcast = async (podcastId: string): Promise<Podcast> => {
  const { data } = await apiClient.get(`/podcasts/${podcastId}`);

  return data.data;
};

export const getPodcastEpisodes = async (
  podcastId: string,
): Promise<Track[]> => {
  const data = await apiClient.get(`/episodes/${podcastId}/podcast`);

  return normalilzeEpisodeResponse(data.data.data);
};

export const getGenres = async (): Promise<Genre[]> => {
  const { data } = await apiClient.get("/meta/music/genres");

  return data.data.filter(({ count }: Genre) => count > 0);
};

export const getRandomGenreTracks = async (
  genreId: string,
): Promise<Track[]> => {
  const { data } = await apiClient.get(`/tracks/random/${genreId}/genre`);

  return normalizeTrackResponse(data);
};

const createAuthHeader = (
  relativeUrl: string,
  htttpMethod: "get" | "post" | "delete" | "put" = "get",
  payload?: Record<string, any>,
) => {
  const url = `${baseURL}${relativeUrl}`;

  return getAuthToken(url, htttpMethod, signEvent, true, payload);
};

export const getLibraryArtists = async (): Promise<Artist[]> => {
  const url = "/library/artists";
  const { data } = await apiClient.get(url, {
    headers: {
      Authorization: await createAuthHeader(url),
    },
  });

  return data.data.artists;
};

export const getLibraryAlbums = async (): Promise<Album[]> => {
  const url = "/library/albums";
  const { data } = await apiClient.get(url, {
    headers: {
      Authorization: await createAuthHeader(url),
    },
  });

  return data.data.albums;
};

export const getLibraryTracks = async (): Promise<Track[]> => {
  const url = "/library/tracks";
  const { data } = await apiClient.get(url, {
    headers: {
      Authorization: await createAuthHeader(url),
    },
  });

  return normalizeTrackResponse(data.data.tracks);
};

export const getLibraryPlaylists = async (): Promise<Playlist[]> => {
  const url = "/library/playlists";
  const { data } = await apiClient.get(url, {
    headers: {
      Authorization: await createAuthHeader(url),
    },
  });
  return data.data.playlists;
};

export const addToLibrary = async (contentId: string) => {
  const url = "/library";
  const payload = { contentId };
  const { data } = await apiClient.post(url, payload, {
    headers: {
      Authorization: await createAuthHeader(url, "post", payload),
      "Content-Type": "application/json",
    },
  });

  return data;
};

export const deleteFromLibrary = async (contentId: string) => {
  const url = `/library/${contentId}`;
  const { data } = await apiClient.delete(url, {
    headers: {
      Authorization: await createAuthHeader(url, "delete"),
    },
  });

  return data;
};

export const createPlaylist = async (title: string) => {
  const url = "/playlists";
  const payload = { title };
  const { data } = await apiClient.post(url, payload, {
    headers: {
      Authorization: await createAuthHeader(url, "post", payload),
      "Content-Type": "application/json",
    },
  });

  return data.data;
};

export const addToPlaylist = async ({
  trackId,
  playlistId,
}: {
  trackId: string;
  playlistId: string;
}) => {
  const url = "/playlists/add-track";
  const payload = { trackId, playlistId };
  const { data } = await apiClient.post(url, payload, {
    headers: {
      Authorization: await createAuthHeader(url, "post", payload),
      "Content-Type": "application/json",
    },
  });

  return data;
};

export const getPlaylists = async (): Promise<Playlist[]> => {
  const url = "/playlists";
  const { data } = await apiClient.get(url, {
    headers: {
      Authorization: await createAuthHeader(url),
    },
  });
  return data.data;
};

export const getUserPlaylists = async (uid: string): Promise<Playlist[]> => {
  const url = `/playlists/user/${uid}`;
  const { data } = await apiClient.get(url);

  return data.data;
};

export const getPlaylist = async (
  playlistId: string,
): Promise<{
  title: string;
  userId: string;
  tracks: Track[];
}> => {
  const url = `/playlists/${playlistId}`;
  const { data } = await apiClient.get(url);
  return data.data;
};

export const deletePlaylist = async (playlistId: string) => {
  const url = `/playlists/${playlistId}`;
  const { data } = await apiClient.delete(url, {
    headers: {
      Authorization: await createAuthHeader(url, "delete"),
    },
  });

  return data;
};

export const reorderPlaylist = async ({
  playlistId,
  trackList,
}: {
  playlistId: string;
  trackList: string[];
}) => {
  const url = `/playlists/reorder`;
  const payload = { trackList, playlistId };
  const { data } = await apiClient.post(url, payload, {
    headers: {
      Authorization: await createAuthHeader(url, "post", payload),
    },
  });

  return data;
};

export const useCreateUser = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) => {
  return useMutation({
    mutationFn: async ({
      userId, // TODO - add artworkUrl
      // artworkUrl,
    }: {
      userId: string;
      // artworkUrl?: string;
    }) => {
      const { data } = await apiClient.post<
        ResponseObject<{ userId: string; name: string }>
      >(`/accounts`, {
        userId,
        // artworkUrl,
      });
      return data.data;
    },
    onSuccess() {
      onSuccess?.();
    },
    onError(response: ResponseObject) {
      onError?.(response?.error ?? "Error creating user");
    },
  });
};

export const useAddPubkeyToUser = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) => {
  const url = `/accounts/pubkey`;

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const payload = {
        authToken: await auth().currentUser?.getIdToken(),
      };
      const { data } = await apiClient.post<
        ResponseObject<{ pubkey: string; userId: string }>
      >(url, payload, {
        headers: {
          Authorization: await createAuthHeader(url, "post", payload),
          "Content-Type": "application/json",
        },
      });
      return data.data;
    },
    onSuccess() {
      queryClient.invalidateQueries(["userData"]);
      onSuccess?.();
    },
    onError(response: ResponseObject) {
      onError?.(response.error ?? "Error adding pubkey to user");
    },
  });
};

export const getPubkeyMetadata = async (pubkey?: string | null) => {
  if (!pubkey) return null;
  const { data } = await apiClient.get<ResponseObject<NostrProfileData>>(
    `/accounts/pubkey/${pubkey}`,
    {},
  );

  return data?.data;
};

export const updatePubkeyMetadata = async (pubkey?: string | null) => {
  if (!pubkey) return null;
  const { data } = await apiClient.put<ResponseObject<NostrProfileData>>(
    `/accounts/pubkey/${pubkey}`,
    {},
  );

  return data?.data;
};

export const getActivityFeed = async (
  pubkey: string | null,
  page: number,
  pageSize: number,
) => {
  if (!pubkey) return [];

  const { data } = await apiClient.get<ResponseObject<ActivityItem[]>>(
    `/social/feed/${pubkey}/${page}/${pageSize}`,
    {},
  );

  return data?.data;
};

export const getGlobalActivityFeed = async (page: number, pageSize: number) => {
  const { data } = await apiClient.get<ResponseObject<ActivityItem[]>>(
    `/social/feed/global/${page}/${pageSize}`,
    {},
  );

  // TODO - remove zaps from the backend response
  // we now get these from relays directly
  return data?.data.filter((item) => item.type !== "zap");
};

export const getPubkeyActivity = async (
  pubkey: string | null,
  page: number,
  pageSize: number,
) => {
  if (!pubkey) return [];
  const { data } = await apiClient.get<ResponseObject<ActivityItem[]>>(
    `/social/feed/user/${pubkey}/${page}/${pageSize}`,
    {},
  );

  return data?.data;
};

export const getCommentById = async (commentId: number | null) => {
  if (!commentId) return;
  const { data } = await apiClient.get<ResponseObject<ContentComment>>(
    `/comments/id/${commentId}`,
    {},
  );

  return data?.data;
};

export const saveCommentEventId = async (
  kind1EventId: string,
  zapRequestEventId: string,
) => {
  const url = `/comments/event-id/${zapRequestEventId}/${kind1EventId}`;
  const { data } = await apiClient.put<ResponseObject<ContentComment>>(
    url,
    null,
    {
      headers: {
        Authorization: await createAuthHeader(url, "put"),
      },
    },
  );

  return data?.data;
};

export const saveLegacyReply = async (content: string, commentId: number) => {
  const url = `/comments/reply`;
  const payload = {
    content,
    commentId,
  };

  const { data } = await apiClient.post<ResponseObject<ContentComment>>(
    url,
    payload,
    {
      headers: {
        Authorization: await createAuthHeader(url, "post", payload),
      },
    },
  );

  return data?.data;
};

type Metadata = Pick<
  ActivityItem,
  | "artist"
  | "contentArtwork"
  | "contentId"
  | "contentTitle"
  | "contentType"
  | "parentContentId"
  | "parentContentTitle"
>;

export const getContentMetadataMap = async (
  trackIds: string[],
): Promise<Record<string, Metadata>> => {
  const queryParams = new URLSearchParams();
  trackIds.forEach((id) => {
    queryParams.append("guid", id);
  });

  const { data } = await apiClient.get<ResponseObject<Metadata[]>>(
    `/meta/content?${queryParams.toString()}`,
  );

  // transform data into a map
  const map: Record<string, Metadata> = {};
  data.data.forEach((item) => {
    map[item.contentId] = item;
  });
  return map;
};

interface UsernameCheck {
  username: string;
  isValid: boolean;
}
export const checkUsername = async (username: string) => {
  const { data } = await apiClient.post<ResponseObject<UsernameCheck[]>>(
    `/splits/check-usernames`,
    { usernames: [username] },
  );
  return data;
};

export const checkIPRegion = async () => {
  return apiClient.get<ResponseObject<{ regionPass: boolean }>>(
    `accounts/check-region`,
    {},
  );
};
