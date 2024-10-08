import TrackPlayer, { Event, State } from "react-native-track-player";
import { skipToPrevious } from "@/utils";
import { startEarning, stopEarning } from "./earning";

// This service enables the use of the media controls on the lock screen
// and in the notification tray
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

  TrackPlayer.addEventListener(
    Event.PlaybackActiveTrackChanged,
    async (event) => {
      if (event.index !== undefined) {
        const track = await TrackPlayer.getTrack(event.index);
        if (track && track.hasPromo) {
          startEarning(track.id);
        } else {
          stopEarning();
        }
      }
    },
  );

  TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
    if (event.state === State.Playing) {
      // Resume earning if it was paused
      const track = await TrackPlayer.getActiveTrack();
      if (track?.hasPromo) {
        startEarning(track.id);
      }
    } else {
      stopEarning();
    }
  });
};
