import TrackPlayer, { Event } from "react-native-track-player";

export const musicService = async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log("play");
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log("pause");
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    console.log("previous");
    TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    console.log("next");
    TrackPlayer.skipToNext();
  });
};
