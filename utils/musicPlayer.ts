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

export const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const normalizedHours = hours > 0 ? `${hours}:` : "";
  const normalizedMinutes = minutes > 0 ? `${minutes}:` : "0:";
  const normalizedSeconds = `${seconds}`.padStart(2, "0");

  return `${normalizedHours}${normalizedMinutes}${normalizedSeconds}`;
};
