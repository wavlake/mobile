import {
  AlbumsIcon,
  ArtistsIcon,
  SongsIcon,
  PlaylistsIcon,
  Center,
  LibraryMenu,
  PillTabView,
  Text,
  Button,
} from "@/components";
import { brandColors } from "@/constants";
import { useAuth } from "@/hooks";
import { View } from "react-native";
import { useRouter } from "expo-router";

export default function LibraryPage() {
  const { pubkey } = useAuth();
  const router = useRouter();

  return pubkey ? (
    <PillTabView tabNames={["Music", "Shows"]}>
      <PillTabView.Item style={{ width: "100%" }}>
        <LibraryMenu>
          <LibraryMenu.Item
            title="Artists"
            color={brandColors.pink.DEFAULT}
            href="/library/music/artists"
            Icon={ArtistsIcon}
          />
          <LibraryMenu.Item
            title="Albums"
            color={brandColors.purple.DEFAULT}
            href="/library/music/albums"
            Icon={AlbumsIcon}
          />
          <LibraryMenu.Item
            title="Songs"
            color={brandColors.mint.DEFAULT}
            href="/library/music/songs"
            Icon={SongsIcon}
          />
          <LibraryMenu.Item
            title="Playlists"
            color={brandColors.orange.DEFAULT}
            href="/library/music/playlists"
            Icon={PlaylistsIcon}
          />
        </LibraryMenu>
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <Center>
          <Text>Podcast library coming soon</Text>
        </Center>
      </PillTabView.Item>
    </PillTabView>
  ) : (
    <Center>
      <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        <Text style={{ fontSize: 18 }}>
          You must be logged in to create a library.
        </Text>
      </View>
      <Button onPress={() => router.push("/auth")}>Register</Button>
    </Center>
  );
}
