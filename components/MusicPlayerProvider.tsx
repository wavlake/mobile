import {
  createContext,
  type PropsWithChildren,
  useContext,
  useRef,
  useState,
} from "react";
import TrackPlayer, {
  Event,
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
}

// Actions from lock screen/notification bar trigger events here via musicService

const MusicPlayerContext = createContext<MusicPlayerContextProps | null>(null);

export const MusicPlayerProvider = ({ children }: PropsWithChildren) => {
  const [playerTitle, setPlayerTitle] = useState<string>();
  const [currentTrackListId, setCurrentTrackListId] = useState<string>();
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [trackQueue, setTrackQueue] = useState<Track[] | null>(null);
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

    if (trackQueue) {
      setIsSwitchingTrackList(true);
      await TrackPlayer.reset();
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
