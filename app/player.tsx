import { useNavigation } from "expo-router";
import {
  FullSizeMusicPlayer,
  ModalCloseButton,
  useMusicPlayer,
} from "@/components";
import { useEffect } from "react";
import { Header } from "@rneui/themed";
import { useTheme } from "@react-navigation/native";

export default function Player() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { playerTitle, songQueue, currentSongIndex } = useMusicPlayer();
  const currentSong = songQueue[currentSongIndex];
  const { title } = currentSong || {};
  const headerTitle = playerTitle ?? title;

  useEffect(() => {
    navigation.setOptions({ headerTitle });
  }, [headerTitle]);

  return (
    <>
      <Header
        backgroundColor={colors.background}
        containerStyle={{ borderBottomWidth: 0 }}
        leftComponent={<ModalCloseButton />}
        centerComponent={{
          text: headerTitle,
          style: { color: colors.text, fontSize: 18, fontWeight: "500" },
        }}
      />
      <FullSizeMusicPlayer />
    </>
  );
}
