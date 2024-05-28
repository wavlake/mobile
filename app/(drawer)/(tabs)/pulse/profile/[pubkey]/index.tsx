import { View, Image, ActivityIndicator, FlatList } from "react-native";
import { SectionHeader } from "@/components/SectionHeader";
import { brandColors } from "@/constants";
import { Text } from "@/components/Text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMiniMusicPlayer } from "@/components/MiniMusicPlayerProvider";
import { Avatar, SlimButton, Center } from "@/components";
import { usePubkeyPlaylists } from "@/hooks/playlist/usePubkeyPlaylists";
import { PlaylistRow } from "@/components/PlaylistRow";
import { useEffect, useState } from "react";
import { openURL } from "expo-linking";
import { useCatalogPubkey } from "@/hooks/nostrProfile/useCatalogPubkey";
import { ActivityItem, mockActivityItems } from "../..";

const AVATAR_SIZE = 80;
export default function PulseProfilePage() {
  const { pubkey } = useLocalSearchParams();

  if (!pubkey || typeof pubkey !== "string") {
    return (
      <Center>
        <Text>Invalid pubkey</Text>
      </Center>
    );
  }

  return <PubkeyProfilePage pubkey={pubkey} />;
}

const PubkeyProfilePage = ({ pubkey }: { pubkey: string }) => {
  const { height } = useMiniMusicPlayer();
  const activity: ActivityItem[] = mockActivityItems;
  // const { data: activity = [], isLoading } = usePubkeyActivity(
  //   pubkey as string,
  // );
  return (
    <FlatList
      data={activity}
      ListHeaderComponent={() => (
        <View>
          <UserDetails pubkey={pubkey} />
          <Playlists pubkey={pubkey} />
        </View>
      )}
      renderItem={({ item, index }) => <ActivityItemRow item={item} />}
      keyExtractor={(item) => item.contentId + item.timestamp}
    />
  );
};

const UserDetails = ({ pubkey }: { pubkey: string }) => {
  const { data: profileData, isLoading } = useCatalogPubkey(pubkey as string);
  const { picture, name, banner, about, website, nip05 } =
    profileData?.metadata ?? {};
  const { followerCount, follows } = profileData || {};

  const [isNip05Verified, setIsNip05Verified] = useState(false);
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

            {profileData && (
              <Text style={{ fontSize: 12 }}>
                {`${followerCount ?? 0} followers • ${
                  follows?.length ?? 0
                } following`}
              </Text>
            )}
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

const Playlists = ({ pubkey }: { pubkey: string }) => {
  const router = useRouter();
  const { data: playlists = [], isLoading } = usePubkeyPlaylists(
    pubkey as string,
  );

  const handlePlaylistPress = (playlist: { id: string; title: string }) => {
    router.push({
      pathname: `/pulse/profile/${pubkey}/playlist/${playlist.id}`,
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
          pathname: `/pulse/profile/${pubkey}/playlists`,
          params: {
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

const ActivityItemRow = ({ item }: { item: ActivityItem }) => {
  const router = useRouter();

  const handlePlaylistPress = () => {
    // router.push({
    //   pathname: `/library/music/playlists/${playlist.id}`,
    //   params: {
    //     headerTitle: playlist.title,
    //     playlistTitle: playlist.title,
    //     includeBackButton: true,
    //   },
    // });
  };

  return (
    <View>
      <Text>{item.contentTitle}</Text>
    </View>
  );
};
