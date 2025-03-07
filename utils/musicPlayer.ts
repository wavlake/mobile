import TrackPlayer, { State } from "react-native-track-player";

export const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const normalizedHours = hours > 0 ? `${hours}:` : "";
  const normalizedMinutes = minutes > 0 ? `${minutes}`.padStart(2, "0") : "00";
  const normalizedSeconds = `${seconds}`.padStart(2, "0");

  return `${normalizedHours}${normalizedMinutes}:${normalizedSeconds}`;
};

export const canSkipToPrevious = async () => {
  const { position } = await TrackPlayer.getProgress();
  const currentTrackIndex = (await TrackPlayer.getActiveTrackIndex()) ?? 0;

  return position < 5 && currentTrackIndex > 0;
};

export const skipToPrevious = async () => {
  const canSkip = await canSkipToPrevious();

  if (canSkip) {
    await TrackPlayer.skipToPrevious();
  } else {
    await TrackPlayer.seekTo(0);
  }
};

export const skipToNext = async () => {
  await TrackPlayer.skipToNext();
};

export const togglePlayPause = async () => {
  const { state } = await TrackPlayer.getPlaybackState();
  if (state !== State.Paused) {
    await TrackPlayer.pause();
  } else if (state === State.Paused) {
    await TrackPlayer.play();
  }
};

export const seekTo = async (seconds: number) => {
  await TrackPlayer.seekTo(seconds);
};
