import { Stack } from "expo-router";
import { FullSizeMusicPlayer, useMusicPlayer } from "@/components";

export default function Player() {
  const { playerTitle } = useMusicPlayer();
  const headerTitle = playerTitle ?? "";

  return (
    <>
      <Stack.Screen options={{ headerTitle }} />
      <FullSizeMusicPlayer />
    </>
  );
}
