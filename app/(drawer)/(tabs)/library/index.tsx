import {
  AlbumsIcon,
  ArtistsIcon,
  SongsIcon,
  PlaylistsIcon,
  Center,
  LibraryMenu,
  PillTabView,
  Text,
  AddNostr,
} from "@/components";
import { brandColors } from "@/constants";
import { useAuth } from "@/hooks";

export default function LibraryPage() {
  const { pubkey } = useAuth();

  return pubkey ? (
    <PillTabView tabNames={["Music", "Podcasts"]}>
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
    <AddNostr />
  );
}
