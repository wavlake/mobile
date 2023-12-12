import TrackPlayer, { Capability, Event } from "react-native-track-player";
import { skipToPrevious } from "@/utils";

// This service enables the use of the media controls on the lock screen
// and in the notification tray

export const setupTrackPlayer = async () => {
  // this will throw an error and return undefined if the player has not been set up yet
  const state = await TrackPlayer.getPlaybackState().catch((error) => {
    // nothing to handle here
  });

  // on initial load, state will be undefined, so we set up the player
  if (state === undefined) {
    TrackPlayer.registerPlaybackService(() => musicService);

    await TrackPlayer.setupPlayer().catch((error) => {
      console.log("error setting up player", error);
    });

    TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
    }).catch((error) => {
      console.log("error updating options", error);
    });
  } else {
    // player was previously set up
  }
};

export const musicService = async () => {
  try {
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
  } catch (error) {
    console.log("error registering playback service", error);
  }
};
