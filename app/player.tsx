import { Stack } from "expo-router";
import { FullSizeMusicPlayer, useMusicPlayer } from "@/components";

export default function Player() {
  const { playerTitle, currentSong } = useMusicPlayer();
  const headerTitle = playerTitle ?? currentSong?.title ?? "";

  return (
    <>
      <Stack.Screen options={{ headerTitle }} />
      <FullSizeMusicPlayer />
    </>
  );
}
