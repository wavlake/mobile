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
  activeTrack: Track | undefined;
  currentTrackListId?: string;
  playerTitle?: string;
  isSwitchingTrackList: boolean;
  loadTrackList: LoadTrackList;
  reset: () => Promise<void>;
}

// Actions from lock screen/notification bar trigger events here via musicService

const MusicPlayerContext = createContext<MusicPlayerContextProps | null>(null);

export const MusicPlayerProvider = ({ children }: PropsWithChildren) => {
  const [playerTitle, setPlayerTitle] = useState<string>();
  const [trackMetadataMap, setTrackMetadataMap] = useState<
    Record<string, Track>
  >({});
  const [currentTrackListId, setCurrentTrackListId] = useState<string>();
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

    const trackMetadata = trackList.reduce(
      (acc, track) => {
        acc[track.id] = track;
        return acc;
      },
      {} as Record<string, Track>,
    );

    setTrackMetadataMap(trackMetadata);

    const currentTrackIndex = startIndex ?? 0;
    const currentTrack = trackList[currentTrackIndex];

    setPlayerTitle(playerTitle ?? currentTrack.title);

    const trackQueue = await TrackPlayer.getQueue();
    if (trackQueue) {
      setIsSwitchingTrackList(true);
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

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    const trackQueue = await TrackPlayer.getQueue();

    if (event.index === undefined || isLoadingTrackList.current) {
      return;
    }

    const activeTrack = trackQueue ? trackQueue[event.index] : null;
    const currentTrack = trackMetadataMap[activeTrack?.id ?? ""];

    switch (event.type) {
      case Event.PlaybackActiveTrackChanged:
        if (currentTrack) {
          publishTrackToNostr(currentTrack).catch(console.error);
        }
        break;
    }
  });

  const activeRNTPTrack = useActiveTrack();
  const activeTrack = activeRNTPTrack
    ? trackMetadataMap[activeRNTPTrack.id]
    : undefined;

  return (
    <MusicPlayerContext.Provider
      value={{
        activeTrack,
        currentTrackListId,
        playerTitle,
        isSwitchingTrackList,
        loadTrackList,
        reset,
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
