import {
  createContext,
  type PropsWithChildren,
  useContext,
  useRef,
  useState,
} from "react";
import TrackPlayer, {
  Event,
  useActiveTrack,
  useTrackPlayerEvents,
  Track as RNTPTrack,
  RepeatMode,
} from "react-native-track-player";
import {
  getCachedNostrRelayListEvent,
  getPubkeyFromCachedSeckey,
  getWriteRelayUris,
  publishLiveStatusEvent,
  Track,
  Episode,
} from "@/utils";
import { getActiveTrackIndex } from "react-native-track-player/lib/trackPlayer";
import { getUserAgent } from "@/app.config";
import DeviceInfo from "react-native-device-info";
import { useEarnPromo } from "@/hooks";

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
  activeTrack: Track | undefined;
  currentTrackListId?: string;
  playerTitle?: string;
  isSwitchingTrackList: boolean;
  isShuffled: boolean;
  isEarning: boolean;
  totalEarned: number;
  repeatMode: RepeatMode;
  toggleShuffle: () => Promise<void>;
  loadTrackList: LoadTrackList;
  reset: () => Promise<void>;
  cycleRepeatMode: () => Promise<void>;
}

// Actions from lock screen/notification bar trigger events here via musicService

const MusicPlayerContext = createContext<MusicPlayerContextProps | null>(null);

const shuffleArrayWithIndexAtStart = (array: any[], index: number) => {
  const shuffledArray = [...array];
  const [removedItem] = shuffledArray.splice(index, 1);
  shuffledArray.sort(() => Math.random() - 0.5);
  shuffledArray.unshift(removedItem);
  return shuffledArray;
};

export const MusicPlayerProvider = ({ children }: PropsWithChildren) => {
  const userAgent = getUserAgent(DeviceInfo.getModel());
  const [playerTitle, setPlayerTitle] = useState<string>();
  const [trackMetadataMap, setTrackMetadataMap] = useState<
    Record<string, Track>
  >({});
  const [currentTrackListId, setCurrentTrackListId] = useState<string>();
  const isLoadingTrackList = useRef(false);
  const [isSwitchingTrackList, setIsSwitchingTrackList] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.Off);
  const [isShuffled, setIsShuffled] = useState(false);
  const [unshuffledTrackList, setUnshuffledTrackList] = useState<RNTPTrack[]>(
    [],
  );
  const activeRNTPTrack = useActiveTrack();
  const activeTrack = activeRNTPTrack
    ? trackMetadataMap[activeRNTPTrack.id]
    : undefined;

  const { isEarning, totalEarned } = useEarnPromo(activeTrack?.id);

  const loadTrackList: LoadTrackList = async ({
    trackList,
    trackListId,
    playerTitle,
    startIndex,
  }) => {
    isLoadingTrackList.current = true;
    let normalizedTrackList: RNTPTrack[] = trackList.map((t) => ({
      id: t.id,
      url: t.liveUrl,
      duration: t.duration,
      title: t.title,
      artist: t.artist,
      album: t.albumTitle,
      artwork: t.artworkUrl,
      userAgent,
    }));

    const trackMetadata = trackList.reduce(
      (acc, track) => {
        acc[track.id] = track;
        return acc;
      },
      {} as Record<string, Track>,
    );

    setTrackMetadataMap(trackMetadata);
    setUnshuffledTrackList(normalizedTrackList);
    const currentTrackIndex = startIndex ?? 0;
    const currentTrack = trackList[currentTrackIndex];

    setPlayerTitle(playerTitle ?? currentTrack.title);

    const trackQueue = await TrackPlayer.getQueue();
    if (trackQueue) {
      setIsSwitchingTrackList(true);
    }

    if (isShuffled) {
      normalizedTrackList = shuffleArrayWithIndexAtStart(
        normalizedTrackList,
        currentTrackIndex,
      );
    }

    await TrackPlayer.setQueue(normalizedTrackList);

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
    setCurrentTrackListId(undefined);
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

  const generateListOfIndicies = (length: number) => {
    return [...Array.from({ length }, (_, i) => i)];
  };

  const toggleShuffle = async () => {
    const currentQueue = await TrackPlayer.getQueue();
    const activeIndex = await getActiveTrackIndex();
    if (activeIndex === undefined) {
      return;
    }
    const activeTrackId = currentQueue?.[activeIndex]?.id;
    const activeTrackUnshuffIndex = unshuffledTrackList.findIndex(
      (t) => activeTrackId === t.id,
    );

    // remove all tracks except the current one
    await TrackPlayer.removeUpcomingTracks();
    // remove previous track indicies
    const previousIndicies = generateListOfIndicies(activeIndex);
    await TrackPlayer.remove(previousIndicies);

    if (isShuffled) {
      const unshuffledQueueWithoutCurrent = unshuffledTrackList.filter(
        (t) => t.id !== activeTrackId,
      );
      // add the unshuffled queue, skipping the first track
      await TrackPlayer.add(unshuffledQueueWithoutCurrent);
      // move the active track to its proper index
      await TrackPlayer.move(0, activeTrackUnshuffIndex);
    } else {
      // shuffle the queue
      const shuffledQueue = shuffleArrayWithIndexAtStart(
        unshuffledTrackList,
        activeTrackUnshuffIndex,
      );

      // add the shuffled queue, skip the first track
      await TrackPlayer.add(shuffledQueue.slice(1));
    }
    setIsShuffled(!isShuffled);
  };

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    const trackQueue = await TrackPlayer.getQueue();

    if (event.index === undefined || isLoadingTrackList.current) {
      return;
    }

    const activeRNTPTrack = trackQueue ? trackQueue[event.index] : null;
    const activeTrack = trackMetadataMap[activeRNTPTrack?.id ?? ""];

    switch (event.type) {
      case Event.PlaybackActiveTrackChanged:
        if (activeTrack) {
          publishTrackToNostr(activeTrack).catch(console.error);
        }
        break;
    }
  });

  const cycleRepeatMode = async () => {
    let newRepeatMode: RepeatMode;
    switch (repeatMode) {
      case RepeatMode.Off:
        newRepeatMode = RepeatMode.Queue;
        break;
      case RepeatMode.Queue:
        newRepeatMode = RepeatMode.Track;
        break;
      case RepeatMode.Track:
        newRepeatMode = RepeatMode.Off;
        break;
      default:
        newRepeatMode = RepeatMode.Off;
    }

    await TrackPlayer.setRepeatMode(newRepeatMode);
    setRepeatMode(newRepeatMode);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        activeTrack,
        currentTrackListId,
        playerTitle,
        isSwitchingTrackList,
        repeatMode,
        isShuffled,
        isEarning,
        totalEarned,
        toggleShuffle,
        loadTrackList,
        reset,
        cycleRepeatMode,
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
