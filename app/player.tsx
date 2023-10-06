import { useNavigation } from "expo-router";
import { FullSizeMusicPlayer, useMusicPlayer } from "@/components";
import { useEffect } from "react";

export default function Player() {
  const { playerTitle } = useMusicPlayer();
  const headerTitle = playerTitle ?? "";
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle,
    });
  }, [navigation, headerTitle]);

  return <FullSizeMusicPlayer />;
}
