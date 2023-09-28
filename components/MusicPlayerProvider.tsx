import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import { useAuth, useNostrRelayList } from "@/hooks";
import { publishLiveStatusEvent } from "@/utils";

export interface MusicPlayerTrack {
  id: string;
  liveUrl: string;
  avatarUrl?: string;
  artworkUrl: string;
  title: string;
  artist: string;
  artistId: string;
  albumId: string;
  albumTitle: string;
  durationInMs: number;
}

export type LoadTrackList = ({
  trackList,
  trackListId,
  playerTitle,
  startIndex,
}: {
  trackList: MusicPlayerTrack[];
  trackListId?: string;
  playerTitle?: string;
  startIndex?: number;
}) => Promise<void>;

type Status = "loadingTrackList" | "playing" | "paused" | "off";

interface MusicPlayerContextProps {
  trackQueue: MusicPlayerTrack[];
  currentTrackListId?: string;
  currentTrackIndex: number;
  currentTrack?: MusicPlayerTrack;
  playerTitle?: string;
  status: Status;
  positionInMs: number;
  loadTrackList: LoadTrackList;
  togglePlayPause: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  clear: () => Promise<void>;
  pauseStatusUpdates: () => void;
  setPosition: (positionInMs: number) => Promise<void>;
  canGoBack: () => boolean;
  back: () => Promise<void>;
  forward: () => Promise<void>;
}

const MusicPlayerContext = createContext<MusicPlayerContextProps | null>(null);

export const MusicPlayerProvider = ({ children }: PropsWithChildren) => {
  const { pubkey } = useAuth();
  const { writeRelayList } = useNostrRelayList();
  const trackQueue = useRef<MusicPlayerTrack[]>([]);
  const currentSound = useRef<Audio.Sound | null>(null);
  const currentTrackIndex = useRef(0);
  const currentTrackListId = useRef<string>();
  const isStatusUpdatesPaused = useRef(false);
  const [status, setStatus] = useState<Status>("off");
  const [positionInMs, setPositionInMs] = useState<number>(0);
  const [playerTitle, setPlayerTitle] = useState<string>();

  const hasNext = () =>
    currentTrackIndex.current < trackQueue.current.length - 1;
  const loadTrack = useCallback(
    async (track: MusicPlayerTrack) => {
      if (currentSound.current) {
        await currentSound.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({
        uri: track.liveUrl,
      });

      currentSound.current = sound;
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      setStatus("playing");
      await sound.playAsync();

      if (pubkey) {
        return publishLiveStatusEvent({
          pubkey,
          trackUrl: `https://wavlake.com/track/${track.id}`,
          content: `${track.title} - ${track.artist}`,
          durationInMs: track.durationInMs,
          relayUris: writeRelayList,
        });
      }
    },
    [pubkey, writeRelayList],
  );
  const loadTrackList: LoadTrackList = useCallback(
    async ({ trackList, trackListId, playerTitle, startIndex }) => {
      if (status === "loadingTrackList") {
        return;
      }

      setStatus("loadingTrackList");

      trackQueue.current = trackList;
      currentTrackIndex.current = startIndex ?? 0;
      currentTrackListId.current = trackListId;

      const currentTrack = trackList[currentTrackIndex.current];

      if (currentTrack) {
        await loadTrack(currentTrack);
      }

      setPlayerTitle(playerTitle ?? currentTrack.title);
    },
    [loadTrack],
  );
  const onPlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (isStatusUpdatesPaused.current) {
      return;
    }

    if (status.isLoaded) {
      setPositionInMs(status.positionMillis);
    }

    const hasLastTrackInQueueJustFinished =
      status.isLoaded &&
      status.didJustFinish &&
      currentTrackIndex.current >= trackQueue.current.length - 1;

    if (hasLastTrackInQueueJustFinished) {
      setStatus("paused");
      await currentSound.current?.setPositionAsync(0);
    }

    if (status.isLoaded && status.didJustFinish && hasNext()) {
      await forward();
    }
  };
  const play = async () => {
    await currentSound.current?.playAsync();
    setStatus("playing");
  };
  const pause = async () => {
    await currentSound.current?.pauseAsync();
    setStatus("paused");
  };
  const clear = async () => {
    currentTrackIndex.current = 0;
    trackQueue.current = [];
    setStatus("off");
    await currentSound.current?.unloadAsync();
  };
  const pauseStatusUpdates = () => {
    isStatusUpdatesPaused.current = true;
  };
  const setPosition = async (positionInMs: number) => {
    await currentSound.current?.setPositionAsync(positionInMs);
    isStatusUpdatesPaused.current = false;
  };
  const togglePlayPause = async () => {
    if (status === "playing") {
      setStatus("paused");
      await pause();
    } else if (status === "paused") {
      setStatus("playing");
      await play();
    }
  };
  const canGoBack = () => {
    return positionInMs < 5000 && currentTrackIndex.current > 0;
  };
  const back = async () => {
    isStatusUpdatesPaused.current = true;
    setPositionInMs(0);

    if (canGoBack()) {
      const previousTrackIndex = currentTrackIndex.current - 1;

      currentTrackIndex.current = previousTrackIndex;
      await loadTrack(trackQueue.current[previousTrackIndex]);
    } else {
      await currentSound.current?.replayAsync();
    }
    isStatusUpdatesPaused.current = false;
  };
  const forward = async () => {
    if (!hasNext()) {
      return;
    }

    const nextTrackIndex = currentTrackIndex.current + 1;

    isStatusUpdatesPaused.current = true;
    setPositionInMs(0);
    currentTrackIndex.current = nextTrackIndex;
    await loadTrack(trackQueue.current[nextTrackIndex]);
    isStatusUpdatesPaused.current = false;
  };

  useEffect(() => {
    return () => {
      currentSound.current?.unloadAsync();
    };
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{
        trackQueue: trackQueue.current,
        currentTrackListId: currentTrackListId.current,
        currentTrackIndex: currentTrackIndex.current,
        currentTrack: trackQueue.current[currentTrackIndex.current],
        playerTitle,
        status,
        positionInMs,
        loadTrackList,
        play,
        pause,
        togglePlayPause,
        clear,
        pauseStatusUpdates,
        setPosition,
        canGoBack,
        back,
        forward,
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
