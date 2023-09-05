import { Stack } from "expo-router";
import { FullSizeMusicPlayer, useMusicPlayer } from "@/components";

export default function Player() {
  const { playerTitle, songQueue, currentSongIndex } = useMusicPlayer();
  const currentSong = songQueue[currentSongIndex];
  const { title } = currentSong || {};
  const headerTitle = playerTitle ?? title;

  return (
    <>
      <Stack.Screen options={{ headerTitle }} />
      <FullSizeMusicPlayer />
    </>
  );
}
