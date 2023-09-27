import { ReactNode } from "react";
import { View } from "react-native";
import { Link } from "expo-router";
import { Text } from "./Text";

interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  rightNavText?: string;
  rightNavHref?: { pathname: string; params: Record<string, any> };
}

export const SectionHeader = ({
  title,
  icon,
  rightNavText,
  rightNavHref,
}: SectionHeaderProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
      }}
    >
      {icon && (
        <View
          style={{
            width: 24,
            marginRight: 8,
            alignItems: "center",
          }}
        >
          {icon}
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18 }} bold>
            {title}
          </Text>
        </View>
        {rightNavText && rightNavHref && (
          <Link href={rightNavHref}>
            <Text bold>{rightNavText} &gt;</Text>
          </Link>
        )}
      </View>
    </View>
  );
};
