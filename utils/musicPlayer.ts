import { MusicItem } from "./api";

export const formatMusicItemForMusicPlayer = (itemList: MusicItem[]) => {
  return itemList.map(({ liveUrl, artworkUrl, title, artist, duration }) => ({
    liveUrl,
    artworkUrl,
    title,
    artist,
    durationInMs: duration * 1000,
  }));
};
