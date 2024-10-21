import { useNavigation } from "expo-router";
import { FullSizeMusicPlayer } from "@/components";
import { useEffect } from "react";
import { PlayerHeaderTitle } from "@/components/FullSizeMusicPlayer/PlayerHeaderTitle";

// This page is rendered when a user clicks the notification shade in Android
// https://rntp.dev/docs/basics/background-mode#notification
// the notification shade for Android uses this URI: trackplayer://notification.click

export default function NotificationClick() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <PlayerHeaderTitle />,
    });
  }, [navigation]);

  return <FullSizeMusicPlayer />;
}
