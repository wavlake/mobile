import { useNavigation } from "expo-router";
import { FullSizeMusicPlayer, useMusicPlayer } from "@/components";
import { useEffect } from "react";

export default function Player() {
  const navigation = useNavigation();
  const { playerTitle, songQueue, currentSongIndex } = useMusicPlayer();
  const currentSong = songQueue[currentSongIndex];
  const { title } = currentSong || {};
  const headerTitle = playerTitle ?? title;

  useEffect(() => {
    navigation.setOptions({ headerTitle });
  }, [headerTitle]);

  return <FullSizeMusicPlayer />;
}
