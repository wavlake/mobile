import { useNavigation } from "expo-router";
import { FullSizeMusicPlayer, useMusicPlayer, Text } from "@/components";
import { useEffect } from "react";

// This page is rendered when a user clicks the notification shade in Android
// https://rntp.dev/docs/basics/background-mode#notification
// the notification shade for Android uses this URI: trackplayer://notification.click

export default function NotificationClick() {
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
