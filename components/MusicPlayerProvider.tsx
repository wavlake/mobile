import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { Audio, AVPlaybackStatus } from "expo-av";

export interface LoadParams {
  liveUrl: string;
  artworkUrl: string;
  title: string;
  artist: string;
  durationInMs: number;
}

interface Song {
  artworkUrl: string;
  title: string;
  artist: string;
  durationInMs: number;
  sound: Audio.Sound;
}

interface MusicPlayerContextProps {
  currentSong: Omit<Song, "sound"> | null;
  isPlaying: boolean;
  positionInMs: number;
  loadSong: (params: LoadParams) => Promise<void>;
  loadSongList: (params: LoadParams[]) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  clear: () => Promise<void>;
}

const MusicPlayerContext = createContext<MusicPlayerContextProps | null>(null);

export const MusicPlayerProvider = ({ children }: PropsWithChildren) => {
  const songQueue = useRef<LoadParams[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionInMs, setPositionInMs] = useState<number>(0);
  const loadSong = async ({
    liveUrl,
    artworkUrl,
    title,
    artist,
    durationInMs,
  }: LoadParams) => {
    if (currentSong) {
      await currentSong.sound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync({
      uri: liveUrl,
    });

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    setCurrentSong({ artworkUrl, title, artist, durationInMs, sound });
    await sound.playAsync();
    setIsPlaying(true);
  };
  const loadSongList = async (songList: LoadParams[]) => {
    songQueue.current = songList.slice(1);

    if (songList[0]) {
      await loadSong(songList[0]);
    }
  };
  const onPlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPositionInMs(status.positionMillis);
    }

    if (
      status.isLoaded &&
      status.didJustFinish &&
      songQueue.current.length > 0
    ) {
      await loadSong(songQueue.current.shift()!);
    }

    if (
      status.isLoaded &&
      status.didJustFinish &&
      songQueue.current.length === 0
    ) {
      await clear();
    }
  };
  const play = async () => {
    await currentSong?.sound.playAsync();
    setIsPlaying(true);
  };
  const pause = async () => {
    await currentSong?.sound.pauseAsync();
    setIsPlaying(false);
  };
  const clear = async () => {
    await currentSong?.sound.unloadAsync();
    setCurrentSong(null);
    songQueue.current = [];
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (currentSong) {
        currentSong.sound.unloadAsync();
      }
    };
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentSong: currentSong
          ? {
              artworkUrl: currentSong.artworkUrl,
              title: currentSong.title,
              artist: currentSong.artist,
              durationInMs: currentSong.durationInMs,
            }
          : null,
        isPlaying,
        positionInMs,
        loadSong,
        loadSongList,
        play,
        pause,
        clear,
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
