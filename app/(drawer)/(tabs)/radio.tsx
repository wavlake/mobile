import { useNavigation } from "expo-router";
import { FullSizeMusicPlayer } from "@/components";
import { useEffect } from "react";
import { PlayerHeaderTitle } from "@/components/FullSizeMusicPlayer/PlayerHeaderTitle";

export default function RadioPage() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <PlayerHeaderTitle />,
    });
  }, [navigation]);

  return <FullSizeMusicPlayer />;
}
