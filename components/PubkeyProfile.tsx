import { brandColors } from "@/constants";
import { View, Image, TouchableOpacity } from "react-native";
import { useState } from "react";
import { openURL } from "expo-linking";
import { NostrUserProfile } from "@/utils";
import { useAddFollow, useAuth, useRemoveFollow, useUser } from "@/hooks";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { useCatalogPubkey } from "@/hooks/nostrProfile/useCatalogPubkey";
import { Text } from "./shared/Text";
import { Avatar } from "./Avatar";
import { SlimButton } from "./shared/SlimButton";
import { useNostrFollows } from "@/hooks/nostrProfile/useNostrFollows";
import { useFollowersCount } from "@/utils/nostrband";

const AVATAR_SIZE = 80;
export const PubkeyProfile = ({
  profileData,
  pubkey,
}: {
  profileData: NostrUserProfile;
  pubkey: string;
}) => {
  const basePath = useGetBasePathname();
  const { colors } = useTheme();
  const { pubkey: loggedInUserPubkey } = useAuth();
  const userOwnsProfile = pubkey === loggedInUserPubkey;
  const { nostrMetadata } = useUser();
  const { picture, name, banner, about, website, nip05 } = profileData ?? {};
  const { mutateAsync: addFollower, isPending: addLoading } = useAddFollow();
  const { mutateAsync: removeFollower, isPending: removeLoading } =
    useRemoveFollow();
  const userIsFollowing = nostrMetadata?.follows.some(
    (follow) => follow.pubkey === loggedInUserPubkey,
  );
  const [isFollowing, setIsFollowing] = useState(userIsFollowing);
  const router = useRouter();

  const onFollowPress = () => {
    setIsFollowing(!isFollowing);
    if (isFollowing) {
      removeFollower(pubkey);
    } else {
      addFollower(pubkey);
    }
  };

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {userOwnsProfile && (
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: `${basePath}/profile/${loggedInUserPubkey}/edit`,
              params: { includeBackButton: "true" },
            });
          }}
          style={{
            backgroundColor: "black",
            opacity: 0.8,
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 10,
            right: 10,
            top: 10,
            zIndex: 1,
            position: "absolute",
            display: "flex",
            flexDirection: "row",
            gap: 5,
            alignItems: "center",
          }}
        >
          <Text bold style={{ fontSize: 20 }}>
            Edit
          </Text>
          <Icon name="edit" size={20} color={colors.text} />
        </TouchableOpacity>
      )}
      {banner ? (
        <Image
          source={{
            uri: banner,
          }}
          style={{ width: "100%", aspectRatio: 3 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: "100%",
            aspectRatio: 3,
            backgroundColor: "black",
          }}
        />
      )}
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          height: 50,
          paddingHorizontal: 16,
          gap: 10,
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
            justifyContent: "space-between",
            flexGrow: 1,
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              bold
              style={{ fontSize: 18 }}
            >
              {name}
            </Text>
            <FollowerInfo pubkey={pubkey} />
          </View>
          {!userOwnsProfile && (
            <SlimButton
              width={100}
              color="white"
              titleStyle={{ fontSize: 14 }}
              onPress={onFollowPress}
              disabled={addLoading || removeLoading}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </SlimButton>
          )}
        </View>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          paddingHorizontal: 16,
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

const FollowerInfo = ({ pubkey }: { pubkey: string }) => {
  const { data: followerCount = 0 } = useFollowersCount(pubkey);
  const { data: followsList = [] } = useNostrFollows(pubkey);

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      {followerCount > 0 && (
        <>
          <Text style={{ fontSize: 12 }} bold>
            {followerCount}
          </Text>
          <Text style={{ fontSize: 12 }}>{` followers • `}</Text>
        </>
      )}
      {followsList?.length > 0 && (
        <>
          <Text style={{ fontSize: 12 }} bold>
            {followsList.length}
          </Text>
          <Text style={{ fontSize: 12 }}>{` following`}</Text>
        </>
      )}
    </View>
  );
};
