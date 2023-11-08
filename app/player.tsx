import { useNavigation } from "expo-router";
import { FullSizeMusicPlayer, useMusicPlayer, Text } from "@/components";
import { useEffect } from "react";

export default function Player() {
  const { playerTitle } = useMusicPlayer();
  const headerTitle = playerTitle ?? "";
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Text>{headerTitle}</Text>,
    });
  }, [navigation, headerTitle]);

  return <FullSizeMusicPlayer />;
}
