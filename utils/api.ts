import axios from "axios";
import { getAuthToken, signEvent } from "@/utils/nostr";

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

interface TrackResponse extends Track {
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
  content: string;
  createdAt: string;
  msatAmount: number;
  userId: string;
  name: string | null;
  commenterArtworkUrl: string | null;
  isNostr: boolean;
  replies: CommentReply[];
}

interface CommentReply {
  id: number;
  name: string | null;
  userId: string;
  artworkUrl: string | null;
  profileUrl: string | null;
  parentId: number;
  content: string;
  createdAt: string;
  msatAmount: number;
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
}

interface Genre {
  id: number;
  name: string;
  count: number;
}

const baseURL = process.env.EXPO_PUBLIC_WAVLAKE_API_URL;
const apiClient = axios.create({
  baseURL,
});

// Function to normalize the response from the API
// TODO: Make responses from API consistent
const normalizeTrackResponse = (res: TrackResponse[]): Track[] => {
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
  }));
};

export const getNewMusic = async (): Promise<Track[]> => {
  const { data } = await apiClient.get("/tracks/new");

  return normalizeTrackResponse(data.data);
};

export const getTopMusic = async (): Promise<Track[]> => {
  const { data } = await apiClient.get("/charts/music/top");

  return normalizeTrackResponse(data.data);
};

export const getRandomMusic = async (): Promise<Track[]> => {
  const { data } = await apiClient.get("/tracks/random");

  return normalizeTrackResponse(data);
};

export const getFeaturedShows = async (): Promise<Track[]> => {
  const { data } = await apiClient.get("/episodes/featured");

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
  htttpMethod: "get" | "post" | "delete" = "get",
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

export const getPlaylist = async (
  playlistId: string,
): Promise<{
  title: string;
  userId: string;
  tracks: Track[];
}> => {
  const url = `/playlists/${playlistId}`;
  const { data } = await apiClient.get(url, {
    headers: {
      Authorization: await createAuthHeader(url),
    },
  });
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
