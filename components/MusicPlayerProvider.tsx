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

interface MusicPlayerContextProps {
  playerTitle?: string;
  currentSong: MusicPlayerItem | null;
  isPlaying: boolean;
  positionInMs: number;
  loadItemList: LoadItemList;
  togglePlayPause: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  clear: () => Promise<void>;
  pauseStatusUpdates: () => void;
  setPosition: (positionInMs: number) => Promise<void>;
  back: () => Promise<void>;
  forward: () => Promise<void>;
}

const MusicPlayerContext = createContext<MusicPlayerContextProps | null>(null);

export const MusicPlayerProvider = ({ children }: PropsWithChildren) => {
  const songQueue = useRef<MusicPlayerItem[]>([]);
  const currentSound = useRef<Audio.Sound | null>(null);
  const currentSongIndex = useRef(0);
  const isStatusUpdatesPaused = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionInMs, setPositionInMs] = useState<number>(0);
  const [currentSong, setCurrentSong] = useState<MusicPlayerItem | null>(null);
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
    setIsPlaying(true);
    setCurrentSong(item);
    await sound.playAsync();
  };
  const loadItemList: LoadItemList = async ({
    itemList,
    playerTitle,
    startIndex,
  }) => {
    songQueue.current = itemList;
    currentSongIndex.current = startIndex ?? 0;

    if (playerTitle) {
      setPlayerTitle(playerTitle);
    }

    if (itemList[currentSongIndex.current]) {
      await loadItem(itemList[currentSongIndex.current]);
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
      setIsPlaying(false);
      await currentSound.current?.setPositionAsync(0);
    }
  };
  const play = async () => {
    await currentSound.current?.playAsync();
    setIsPlaying(true);
  };
  const pause = async () => {
    await currentSound.current?.pauseAsync();
    setIsPlaying(false);
  };
  const clear = async () => {
    setCurrentSong(null);
    currentSongIndex.current = 0;
    songQueue.current = [];
    setIsPlaying(false);
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
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };
  const back = async () => {
    isStatusUpdatesPaused.current = true;
    setPositionInMs(0);

    if (positionInMs < 5000 && currentSongIndex.current > 0) {
      const previousSongIndex = currentSongIndex.current - 1;

      await loadItem(songQueue.current[previousSongIndex]);
      currentSongIndex.current = previousSongIndex;
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
    await loadItem(songQueue.current[nextSongIndex]);
    currentSongIndex.current = nextSongIndex;
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
        playerTitle,
        currentSong,
        isPlaying,
        positionInMs,
        loadItemList,
        play,
        pause,
        togglePlayPause,
        clear,
        pauseStatusUpdates,
        setPosition,
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
