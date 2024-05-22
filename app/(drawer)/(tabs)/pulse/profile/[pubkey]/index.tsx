import {
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import { SectionHeader } from "@/components/SectionHeader";
import { Divider } from "@rneui/themed";
import { useQuery } from "@tanstack/react-query";
import { NostrUserProfile, Playlist, getGenres } from "@/utils";
import { brandColors } from "@/constants";
import { Text } from "@/components/Text";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useMiniMusicPlayer } from "@/components/MiniMusicPlayerProvider";
import { Avatar, SlimButton, Center } from "@/components";
import { usePubkeyPlaylists } from "@/hooks/playlist/usePubkeyPlaylists";
import { PlaylistRow } from "@/components/PlaylistRow";
import { useLookupNostrProfile } from "@/hooks";
import { useEffect, useState } from "react";
import {
  useNostrFollowers,
  useNostrFollows,
} from "@/hooks/nostrProfile/useFollowers";
import { openURL } from "expo-linking";
import { useUser } from "@/components/UserContextProvider";

const AVATAR_SIZE = 80;
export default function PulsePage() {
  const { height } = useMiniMusicPlayer();
  const { pubkey } = useLocalSearchParams();
  const { data: profileEvent, isLoading } = useLookupNostrProfile(
    pubkey as string,
  );

  if (!pubkey || typeof pubkey !== "string") {
    return (
      <Center>
        <Text>Invalid pubkey</Text>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center>
        <Text>Loading...</Text>
      </Center>
    );
  }

  return (
    <ScrollView style={{ paddingTop: 10, marginBottom: height + 16 }}>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {profileEvent && (
          <UserDetails pubkey={pubkey} profileEvent={profileEvent} />
        )}
        <Playlists />
        <Activity />
      </View>
    </ScrollView>
  );
}

const UserDetails = ({
  profileEvent,
  pubkey,
}: {
  profileEvent: NostrUserProfile;
  pubkey: string;
}) => {
  const { picture, name, banner, about, website, nip05 } = profileEvent;
  const [isNip05Verified, setIsNip05Verified] = useState(false);
  const { followerList, loading: followersLoading } = useNostrFollowers(pubkey);
  const { followList, loading: followsLoading } = useNostrFollows(pubkey);
  useEffect(() => {
    if (!nip05) return;
    // TODO - update nostr-tools to include a queryProfile function
    // queryProfile(nip05).then(() => {});
  }, [nip05]);

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {banner && (
        <Image
          source={{
            uri: banner,
          }}
          style={{ width: "100%", aspectRatio: 3 }}
          resizeMode="cover"
        />
      )}
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          marginHorizontal: 10,
          height: 50,
        }}
      >
        {picture && (
          <View
            style={{
              transform: [{ translateY: -(AVATAR_SIZE / 2) }],
              width: AVATAR_SIZE,
            }}
          >
            <Avatar size={AVATAR_SIZE} imageUrl={picture} />
          </View>
        )}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            marginLeft: 16,
            flexGrow: 1,
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text bold style={{ fontSize: 18 }}>
              {name}
            </Text>

            <Text style={{ fontSize: 12 }}>
              {`${followerList?.length ?? 0} followers • ${
                followList?.length ?? 0
              } following`}
            </Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <SlimButton width={100} color="white" titleStyle={{ fontSize: 14 }}>
              Follow
            </SlimButton>
          </View>
        </View>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          marginHorizontal: 10,
        }}
      >
        <Text>{about}</Text>
        {website && (
          <Text
            style={{
              fontSize: 14,
              color: brandColors.orange.DEFAULT,
              textDecorationLine: "underline",
            }}
            onPress={() => {
              if (website.includes("http")) {
                openURL(website);
              } else {
                openURL(`http://${website}`);
              }
            }}
          >
            {website}
          </Text>
        )}
      </View>
    </View>
  );
};

const Playlists = () => {
  const { pubkey } = useLocalSearchParams();
  const router = useRouter();
  const user = useUser();
  const { data: playlists = [], isLoading } = usePubkeyPlaylists(
    // pubkey as string,
    user.catalogUser?.id,
  );

  console.log("playlists", playlists);
  const handlePlaylistPress = (playlist: { id: string; title: string }) => {
    router.push({
      pathname: `/library/music/playlists/${playlist.id}`,
      params: {
        headerTitle: playlist.title,
        playlistTitle: playlist.title,
        includeBackButton: true,
      },
    });
  };
  return playlists.length ? (
    <View>
      <SectionHeader
        title="Playlists"
        rightNavText="View All"
        rightNavHref={{
          pathname: `/home`,
          params: {
            // artistId,
            // headerTitle: artist.name,
            includeBackButton: true,
          },
        }}
      />
      {isLoading ? (
        <Center>
          <ActivityIndicator />
        </Center>
      ) : (
        playlists.map((item, index) => (
          <PlaylistRow
            playlist={item}
            onPress={() => handlePlaylistPress(item)}
            isLastRow={index === playlists.length - 1}
            height={20}
          />
        ))
      )}
    </View>
  ) : null;
};

const Activity = () => {
  const { pubkey } = useLocalSearchParams();
  const router = useRouter();
  const { data: activity = [], isLoading } = usePubkeyPlaylists(
    pubkey as string,
  );
  const handlePlaylistPress = (playlist: { id: string; title: string }) => {
    router.push({
      pathname: `/library/music/playlists/${playlist.id}`,
      params: {
        headerTitle: playlist.title,
        playlistTitle: playlist.title,
        includeBackButton: true,
      },
    });
  };

  return activity.length ? (
    <View>
      <SectionHeader
        title="Playlists"
        rightNavText="View All"
        rightNavHref={{
          pathname: `/home`,
          params: {
            // artistId,
            // headerTitle: artist.name,
            includeBackButton: true,
          },
        }}
      />
      {isLoading ? (
        <Center>
          <ActivityIndicator />
        </Center>
      ) : (
        activity.map((item, index) => (
          <PlaylistRow
            playlist={item}
            onPress={() => handlePlaylistPress(item)}
            isLastRow={index === activity.length - 1}
            height={20}
          />
        ))
      )}
    </View>
  ) : null;
};
