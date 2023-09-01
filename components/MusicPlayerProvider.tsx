import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { Audio, AVPlaybackStatus } from "expo-av";

export interface MusicPlayerItem {
  liveUrl: string;
  artworkUrl: string;
  title: string;
  artist: string;
  durationInMs: number;
}

type LoadItemList = ({
  itemList,
  playerTitle,
  startIndex,
}: {
  itemList: MusicPlayerItem[];
  playerTitle?: string;
  startIndex?: number;
}) => Promise<void>;

type Status = "playing" | "paused" | "off";

interface MusicPlayerContextProps {
  songQueue: MusicPlayerItem[];
  currentSongIndex: number;
  playerTitle?: string;
  status: Status;
  positionInMs: number;
  loadItemList: LoadItemList;
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
  const songQueue = useRef<MusicPlayerItem[]>([]);
  const currentSound = useRef<Audio.Sound | null>(null);
  const currentSongIndex = useRef(0);
  const isStatusUpdatesPaused = useRef(false);
  const [status, setStatus] = useState<Status>("off");
  const [positionInMs, setPositionInMs] = useState<number>(0);
  const [playerTitle, setPlayerTitle] = useState<string>();

  const hasNext = () => currentSongIndex.current < songQueue.current.length - 1;
  const loadItem = async (item: MusicPlayerItem) => {
    if (currentSound.current) {
      await currentSound.current.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync({
      uri: item.liveUrl,
    });

    currentSound.current = sound;
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    setStatus("playing");
    await sound.playAsync();
  };
  const loadItemList: LoadItemList = async ({
    itemList,
    playerTitle,
    startIndex,
  }) => {
    songQueue.current = itemList;
    currentSongIndex.current = startIndex ?? 0;

    if (itemList[currentSongIndex.current]) {
      await loadItem(itemList[currentSongIndex.current]);
    }

    if (playerTitle) {
      setPlayerTitle(playerTitle);
    }
  };
  const onPlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (isStatusUpdatesPaused.current) {
      return;
    }

    if (status.isLoaded) {
      setPositionInMs(status.positionMillis);
    }

    if (status.isLoaded && status.didJustFinish && hasNext()) {
      await forward();
    }

    if (
      status.isLoaded &&
      status.didJustFinish &&
      currentSongIndex.current >= songQueue.current.length - 1
    ) {
      setStatus("paused");
      await currentSound.current?.setPositionAsync(0);
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
    currentSongIndex.current = 0;
    songQueue.current = [];
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
    return positionInMs < 5000 && currentSongIndex.current > 0;
  };
  const back = async () => {
    isStatusUpdatesPaused.current = true;
    setPositionInMs(0);

    if (canGoBack()) {
      const previousSongIndex = currentSongIndex.current - 1;

      currentSongIndex.current = previousSongIndex;
      await loadItem(songQueue.current[previousSongIndex]);
    } else {
      await currentSound.current?.replayAsync();
    }
    isStatusUpdatesPaused.current = false;
  };
  const forward = async () => {
    if (!hasNext()) {
      return;
    }

    const nextSongIndex = currentSongIndex.current + 1;

    isStatusUpdatesPaused.current = true;
    setPositionInMs(0);
    currentSongIndex.current = nextSongIndex;
    await loadItem(songQueue.current[nextSongIndex]);
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
        songQueue: songQueue.current,
        currentSongIndex: currentSongIndex.current,
        playerTitle,
        status,
        positionInMs,
        loadItemList,
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
