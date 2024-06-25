import {
  createContext,
  type PropsWithChildren,
  useContext,
  useRef,
  useState,
} from "react";
import TrackPlayer, {
  Event,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";
import {
  getCachedNostrRelayListEvent,
  getPubkeyFromCachedSeckey,
  getWriteRelayUris,
  publishLiveStatusEvent,
  Track,
  Episode,
} from "@/utils";

export type LoadTrackList = ({
  trackList,
  trackListId,
  playerTitle,
  startIndex,
}: {
  trackList: Track[]; // Custom track type, not the one from react-native-track-player
  trackListId: string;
  playerTitle?: string;
  startIndex?: number;
}) => Promise<void>;

interface MusicPlayerContextProps {
  trackQueue: Track[] | null;
  currentTrack: Track | null;
  currentTrackIndex?: number;
  currentTrackListId?: string;
  playerTitle?: string;
  isSwitchingTrackList: boolean;
  loadTrackList: LoadTrackList;
  reset: () => Promise<void>;
  toggleShuffle: () => void;
  isShuffleEnabled: boolean;
}

// Actions from lock screen/notification bar trigger events here via musicService

const MusicPlayerContext = createContext<MusicPlayerContextProps | null>(null);

export const MusicPlayerProvider = ({ children }: PropsWithChildren) => {
  const { position } = useProgress();
  const { state: playbackState } = usePlaybackState();
  const [playerTitle, setPlayerTitle] = useState<string>();
  const [currentTrackListId, setCurrentTrackListId] = useState<string>();
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [trackQueue, setTrackQueue] = useState<Track[] | null>(null);
  const [originalTrackQueue, setOriginalTrackQueue] = useState<Track[] | null>(
    null,
  );
  const [isShuffleEnabled, setIsShuffleEnabled] = useState<boolean>(false);
  const [shuffleToggledOnEmpty, setShuffleToggledOnEmpty] =
    useState<boolean>(false);
  const isLoadingTrackList = useRef(false);
  const [isSwitchingTrackList, setIsSwitchingTrackList] = useState(false);

  const loadTrackList: LoadTrackList = async ({
    trackList,
    trackListId,
    playerTitle,
    startIndex,
  }) => {
    isLoadingTrackList.current = true;
    const normalizedTrackList = trackList.map((t) => ({
      id: t.id,
      url: t.liveUrl,
      duration: t.duration,
      title: t.title,
      artist: t.artist,
      album: t.albumTitle,
      artwork: t.artworkUrl,
    }));

    const currentTrackIndex = startIndex ?? 0;
    const currentTrack = trackList[currentTrackIndex];

    setPlayerTitle(playerTitle ?? currentTrack.title);
    setCurrentTrack(currentTrack);
    setCurrentTrackIndex(currentTrackIndex);
    setTrackQueue(trackList);

    if (!isShuffleEnabled || shuffleToggledOnEmpty) {
      setOriginalTrackQueue(trackList); // Save original queue
    }

    if (trackQueue) {
      setIsSwitchingTrackList(true);
      await TrackPlayer.reset();
    }

    if (isShuffleEnabled || shuffleToggledOnEmpty) {
      const shuffledQueue = shuffleArrayExceptFirst([
        currentTrack,
        ...trackList.slice(1),
      ]);
      setTrackQueue(shuffledQueue);
      setShuffleToggledOnEmpty(false); // Reset the flag after shuffling
    }

    await TrackPlayer.add(normalizedTrackList);

    if (startIndex && startIndex > 0) {
      await TrackPlayer.skip(startIndex, 0);
    }

    await TrackPlayer.play();
    setCurrentTrackListId(trackListId);
    isLoadingTrackList.current = false;
    setIsSwitchingTrackList(false);
    publishTrackToNostr(currentTrack).catch(console.error);
  };

  const reset = async () => {
    setPlayerTitle(undefined);
    setCurrentTrack(null);
    setCurrentTrackListId(undefined);
    setCurrentTrackIndex(undefined);
    setTrackQueue(null);
    setOriginalTrackQueue(null);
    setIsShuffleEnabled(false);
    setShuffleToggledOnEmpty(false);
    await TrackPlayer.reset();
  };

  const publishTrackToNostr = async (track: Track) => {
    const pubkey = await getPubkeyFromCachedSeckey();

    if (!pubkey) {
      return;
    }

    const relayListEvent = await getCachedNostrRelayListEvent(pubkey);
    const writeRelayList = relayListEvent
      ? getWriteRelayUris(relayListEvent)
      : null;

    const contentLink =
      track.albumTitle === "podcast"
        ? `https://wavlake.com/episode/${track.id}`
        : `https://wavlake.com/track/${track.id}`;

    await publishLiveStatusEvent({
      pubkey,
      trackUrl: contentLink,
      content: `${track.title} - ${track.artist}`,
      duration: Math.ceil(track.duration ?? 600),
      relayUris: writeRelayList,
    });
  };

  const shuffleArrayExceptFirst = (array: Track[]) => {
    const shuffledArray = array.slice(1); // Exclude the first element
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return [array[0], ...shuffledArray]; // Include the first element back at the start
  };

  const toggleShuffle = async () => {
    if (!trackQueue) {
      setIsShuffleEnabled((prev) => !prev);
      setShuffleToggledOnEmpty((prev) => !prev);
      return;
    }

    const isPlaying = playbackState === State.Playing;
    const currentTrackProgress = position;
    let newQueue: Track[];

    if (isShuffleEnabled) {
      // Restore original track queue
      newQueue = originalTrackQueue || [];
      const normalizedTrackList = newQueue.map((t) => ({
        id: t.id,
        url: t.liveUrl,
        duration: t.duration,
        title: t.title,
        artist: t.artist,
        album: t.albumTitle,
        artwork: t.artworkUrl,
      }));

      const newActiveTrackIndex = newQueue.findIndex(
        (t) => t.id === currentTrack?.id,
      );

      // Player is paused so we can can reset the queue and add the shuffled tracks without any playback hiccups
      await TrackPlayer.reset();
      await TrackPlayer.add(normalizedTrackList);
      await TrackPlayer.skip(newActiveTrackIndex, currentTrackProgress);
      setTrackQueue(newQueue);
    } else {
      // Save original queue before shuffling
      setOriginalTrackQueue(trackQueue);

      // Shuffle the queue leaving the active track unmoved
      const [firstTrack, ...restOfQueue] = trackQueue;
      const shuffledQueue = shuffleArrayExceptFirst(restOfQueue);
      newQueue = [firstTrack, ...shuffledQueue];

      setIsSwitchingTrackList(true);

      const normalizedTrackList = newQueue.map((t) => ({
        id: t.id,
        url: t.liveUrl,
        duration: t.duration,
        title: t.title,
        artist: t.artist,
        album: t.albumTitle,
        artwork: t.artworkUrl,
      }));

      // Player is paused so we can can reset the queue and add the shuffled tracks without any playback hiccups
      await TrackPlayer.reset();
      await TrackPlayer.add(normalizedTrackList);

      // Skip to the first track
      await TrackPlayer.skip(0, currentTrackProgress);

      setIsSwitchingTrackList(false);
    }
    setTrackQueue(newQueue);
    setIsShuffleEnabled((prev) => !prev);

    if (isPlaying) {
      await TrackPlayer.play();
    }
  };

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.nextTrack === undefined || isLoadingTrackList.current) {
      return;
    }

    const currentTrack = trackQueue ? trackQueue[event.nextTrack] : null;

    switch (event.type) {
      case Event.PlaybackTrackChanged:
        setCurrentTrackIndex(event.nextTrack);

        if (currentTrack) {
          setCurrentTrack(currentTrack);
          publishTrackToNostr(currentTrack).catch(console.error);
        }
        break;
    }
  });

  return (
    <MusicPlayerContext.Provider
      value={{
        trackQueue,
        currentTrack,
        currentTrackIndex,
        currentTrackListId,
        playerTitle,
        isSwitchingTrackList,
        loadTrackList,
        reset,
        toggleShuffle,
        isShuffleEnabled,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);

  if (context === null) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }

  return context;
};
