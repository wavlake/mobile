import { TouchableOpacity, View } from "react-native";
import { ElementType, PropsWithChildren } from "react";
import { Text } from "./Text";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";

interface LibraryMenuItemProps {
  title: string;
  color: string;
  href: string;
  Icon: ElementType;
}

const LibraryMenuItem = ({
  color,
  title,
  href,
  Icon,
}: LibraryMenuItemProps) => {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      style={{
        flex: 1,
        backgroundColor: color,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
      }}
      onPress={() => {
        router.push({
          pathname: href,
          params: { headerTitle: title, includeBackButton: "true" },
        });
      }}
    >
      <View style={{ marginLeft: -34 }}>
        <Icon fill={colors.background} width={120} height={120} />
      </View>
      <Text
        style={{ color: colors.background, fontSize: 32, marginLeft: -17 }}
        bold
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export const LibraryMenu = ({ children }: PropsWithChildren) => {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        gap: 8,
      }}
    >
      {children}
    </View>
  );
};

LibraryMenu.Item = LibraryMenuItem;
