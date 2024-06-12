import { brandColors } from "@/constants";
import { View, Image, TouchableOpacity } from "react-native";
import { Avatar, SlimButton, useUser, Text } from "@/components";
import { useEffect, useState } from "react";
import { openURL } from "expo-linking";
import { useAddFollower, useRemoveFollower } from "@/utils";
import { NostrProfileData } from "@/utils/authTokenApi";
import { useAuth } from "@/hooks";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";

const AVATAR_SIZE = 80;
export const PubkeyProfile = ({
  profileData,
}: {
  profileData: NostrProfileData;
}) => {
  const basePath = useGetBasePathname();
  const { colors } = useTheme();
  const { pubkey } = useAuth();
  const userOwnsProfile = pubkey === profileData.publicHex;
  const { catalogUser } = useUser();
  const { picture, name, banner, about, website, nip05 } =
    profileData?.metadata ?? {};
  const { mutateAsync: addFollower } = useAddFollower();
  const { mutateAsync: removeFollower } = useRemoveFollower();
  const userIsFollowing = catalogUser?.nostrProfileData[0]?.follows.some(
    (follow) => follow.pubkey === profileData.publicHex,
  );
  const router = useRouter();
  const onFollowPress = () => {
    if (userIsFollowing) {
      removeFollower(profileData.publicHex);
    } else {
      addFollower(profileData.publicHex);
    }
  };

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
      {userOwnsProfile && (
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: `${basePath}/profile/${pubkey}/edit`,
              params: { includeBackButton: true },
            });
          }}
          style={{
            backgroundColor: "black",
            opacity: 0.7,
            padding: 5,
            borderRadius: 10,
            right: 5,
            top: 5,
            zIndex: 1,
            position: "absolute",
            display: "flex",
            flexDirection: "row",
            gap: 5,
          }}
        >
          <Text bold>Edit</Text>
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
            <FollowerInfo profileData={profileData} />
          </View>
          {/* <SlimButton
            width={100}
            color="white"
            titleStyle={{ fontSize: 14 }}
            onPress={onFollowPress}
          >
            {userIsFollowing ? "Unfollow" : "Follow"}
          </SlimButton> */}
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

const FollowerInfo = ({ profileData }: { profileData: NostrProfileData }) => {
  const { followerCount, follows } = profileData;

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
      {follows.length > 0 && (
        <>
          <Text style={{ fontSize: 12 }} bold>
            {follows.length}
          </Text>
          <Text style={{ fontSize: 12 }}>{` following`}</Text>
        </>
      )}
    </View>
  );
};
