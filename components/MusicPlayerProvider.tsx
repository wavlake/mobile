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
  play: () => Promise<void>;
  pause: () => Promise<void>;
  clear: () => Promise<void>;
  pauseStatusUpdates: () => void;
  setPosition: (positionInMs: number) => Promise<void>;
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

    if (
      status.isLoaded &&
      status.didJustFinish &&
      currentSongIndex.current < songQueue.current.length - 1
    ) {
      const nextSongIndex = currentSongIndex.current + 1;

      await loadItem(songQueue.current[nextSongIndex]);
      currentSongIndex.current = nextSongIndex;
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
    await currentSound.current?.unloadAsync();
    setCurrentSong(null);
    currentSongIndex.current = 0;
    songQueue.current = [];
    setIsPlaying(false);
  };
  const pauseStatusUpdates = () => {
    isStatusUpdatesPaused.current = true;
  };
  const setPosition = async (positionInMs: number) => {
    await currentSound.current?.setPositionAsync(positionInMs);
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
        clear,
        pauseStatusUpdates,
        setPosition,
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
