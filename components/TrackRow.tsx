import { Pressable, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/Text";
import { SatsEarned } from "@/components/SatsEarned";
import { SquareArtwork } from "@/components/SquareArtwork";
import { Track } from "@/utils";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { TrackRowDialogMenu } from "./TrackRowDialogMenu";

interface TrackRowProps {
  track: Track;
  descriptor: string;
  onPress: () => void;
  willDisplaySatsEarned?: boolean;
  willDisplayLikeButton?: boolean;
  showArtwork?: boolean;
}

export const TrackRow = ({
  track,
  descriptor,
  onPress,
  willDisplaySatsEarned = true,
  willDisplayLikeButton = true,
  showArtwork = true,
}: TrackRowProps) => {
  const { colors } = useTheme();
  const { id, title, msatTotal, artworkUrl } = track;
  const [showMenu, setShowMenu] = React.useState(false);
  const handleMenuPress = () => {
    setShowMenu(true);
  };

  return (
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          height: 60,
          paddingRight: 16,
          flexDirection: "row",
          flex: 1,
          alignItems: "center",
        }}
      >
        {showArtwork && artworkUrl && (
          <SquareArtwork size={60} url={artworkUrl} />
        )}
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={{ fontSize: 18 }} numberOfLines={1} bold>
            {title}
          </Text>
          <Text numberOfLines={1}>{descriptor}</Text>
          {willDisplaySatsEarned && <SatsEarned msats={msatTotal} />}
        </View>
      </TouchableOpacity>
      <Pressable onPress={handleMenuPress}>
        <MaterialCommunityIcons
          name="dots-horizontal"
          size={24}
          color={colors.text}
        />
      </Pressable>
      <TrackRowDialogMenu
        isOpen={showMenu}
        setIsOpen={setShowMenu}
        willDisplayLikeButton={willDisplayLikeButton}
        track={track}
      />
    </View>
  );
};
