import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { useMusicPlayer } from "./MusicPlayerProvider";

interface MiniMusicPlayerContextProps {
  height: number;
}

const MiniMusicPlayerContext =
  createContext<MiniMusicPlayerContextProps | null>(null);

export const MiniMusicPlayerProvider = ({ children }: PropsWithChildren) => {
  const { activeTrack } = useMusicPlayer();
  const willShowPlayer = !!activeTrack;
  const height = willShowPlayer ? 70 : 0;
  const value = useMemo(() => ({ height }), [height]);

  return (
    <MiniMusicPlayerContext.Provider value={value}>
      {children}
    </MiniMusicPlayerContext.Provider>
  );
};

export const useMiniMusicPlayer = () => {
  const context = useContext(MiniMusicPlayerContext);

  if (context === null) {
    throw new Error(
      "useMiniMusicPlayer must be used within a MiniMusicPlayerProvider",
    );
  }

  return context;
};
