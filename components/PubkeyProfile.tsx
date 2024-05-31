import { brandColors } from "@/constants";
import { View, Image } from "react-native";
import { Avatar, SlimButton, useUser, Text } from "@/components";
import { useEffect, useState } from "react";
import { openURL } from "expo-linking";
import { useAddFollower, useRemoveFollower } from "@/utils";
import { NostrProfileData } from "@/utils/authTokenApi";

const AVATAR_SIZE = 80;
export const PubkeyProfile = ({
  profileData,
}: {
  profileData: NostrProfileData;
}) => {
  const { catalogUser } = useUser();
  const { picture, name, banner, about, website, nip05 } =
    profileData?.metadata ?? {};
  const { followerCount, follows } = profileData || {};
  const { mutateAsync: addFollower } = useAddFollower();
  const { mutateAsync: removeFollower } = useRemoveFollower();
  const userIsFollowing = catalogUser?.nostrProfileData[0]?.follows.some(
    (follow) => follow.pubkey === profileData.publicHex,
  );

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
            aspectRatio: 10,
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
              // This is a temporary fix to prevent the text from running off the screen
              // this text width should be dynamic and grow to fit the screen
              style={{ fontSize: 18, maxWidth: 180 }}
            >
              {name}
            </Text>
            {profileData && (
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <Text style={{ fontSize: 12 }} bold>
                  {followerCount ?? 0}
                </Text>
                <Text style={{ fontSize: 12 }}>{` followers • `}</Text>
                <Text style={{ fontSize: 12 }} bold>
                  {follows?.length ?? 0}
                </Text>
                <Text style={{ fontSize: 12 }}>{` following`}</Text>
              </View>
            )}
          </View>
          <SlimButton
            width={100}
            color="white"
            titleStyle={{ fontSize: 14 }}
            onPress={onFollowPress}
          >
            {userIsFollowing ? "Unfollow" : "Follow"}
          </SlimButton>
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
