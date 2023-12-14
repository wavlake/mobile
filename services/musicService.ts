import TrackPlayer, { Capability, Event } from "react-native-track-player";
import { skipToPrevious } from "@/utils";

try {
  // during development, if this file is hot reloaded
  // these will both throw warnings
  TrackPlayer.registerPlaybackService(() => musicService);
  TrackPlayer.setupPlayer();
} catch (error) {
  console.log("error registering playback service", error);
}

export const setupPlayer = async () => {
  console.log("setting up player");
  TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause],
    icon: require("../assets/icon.png"),
  }).catch((error) => {
    console.log("error updating options", error);
  });
};

// This service enables the use of the media controls on the lock screen
// and in the notification tray
// https://rntp.dev/docs/basics/playback-service
export const musicService = async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    TrackPlayer.seekTo(event.position);
  });
};
