import { Text, Button, useUser } from "@/components";
import { useRouter } from "expo-router";
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth, useToast } from "@/hooks";
import { BUILD_NUM, VERSION } from "@/app.config";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LoggedInUserAvatar } from "@/components/LoggedInUserAvatar";
import { useSettings } from "@/hooks/useSettings";
import { brandColors } from "@/constants";
import { Tooltip } from "@rneui/themed";

export default function SettingsPage() {
  const router = useRouter();
  const { pubkey } = useAuth();
  const { catalogUser } = useUser();
  const { data: settings } = useSettings();
  const [lnurlInfoOpen, setLnurlInfoOpen] = useState(false);

  // const [defaultZapAmount, setDefaultZapAmount] = useState(
  //   settings?.defaultZapAmount ?? "",
  // );

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView
        contentContainerStyle={{
          paddingVertical: 20,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          <View
            style={{
              alignItems: "center",
            }}
          >
            <Text bold>Version</Text>
            <Text>
              {VERSION} ({BUILD_NUM})
            </Text>
          </View>
          {pubkey && (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                }}
                bold
              >
                Profile
              </Text>
              <LoggedInUserAvatar size={100} />
              <Button
                color="white"
                onPress={() =>
                  router.push({
                    pathname: "/settings/edit-profile",
                  })
                }
                width={160}
              >
                Update
              </Button>
            </View>
          )}
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            {catalogUser?.name && (
              <>
                <Text>Username:</Text>
                <View
                  style={{
                    backgroundColor: brandColors.black.DEFAULT,
                    padding: 6,
                    borderRadius: 6,
                    minWidth: 250,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                    }}
                  >
                    {catalogUser.name}
                  </Text>
                </View>
              </>
            )}
            <Text>Zap default:</Text>
            <View
              style={{
                backgroundColor: brandColors.black.DEFAULT,
                padding: 6,
                borderRadius: 6,
                minWidth: 250,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                }}
              >
                {settings?.defaultZapAmount || "Please set an amount"}
              </Text>
            </View>
            <Button
              color="white"
              onPress={() =>
                router.push({
                  pathname: "/settings/edit-profile",
                })
              }
              style={{
                paddingTop: 10,
              }}
              width={160}
            >
              Edit Details
            </Button>
          </View>
          {catalogUser?.isRegionVerified && catalogUser.emailVerified && (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  paddingBottom: 10,
                }}
                bold
              >
                Wavlake Lightning Address:
              </Text>
              <Text
                style={{
                  textAlign: "center",
                }}
              >
                {catalogUser.profileUrl}@wavlake.com
              </Text>
              <Tooltip
                visible={lnurlInfoOpen}
                onOpen={() => {
                  setLnurlInfoOpen(true);
                }}
                onClose={() => {
                  setLnurlInfoOpen(false);
                }}
                popover={
                  <Text>
                    Your Wavlake Lightning Address is active with your username
                    as the identifier. This is a standard LNURL address you can
                    share with others to receive payments to your Wavlake
                    wallet.
                  </Text>
                }
                backgroundColor={brandColors.black.DEFAULT}
                containerStyle={{
                  padding: 10,
                  width: 200,
                  height: 200,
                }}
                width={200}
                withOverlay={false}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "green",
                    }}
                    bold
                  >
                    Active
                  </Text>
                  <AntDesign name="questioncircle" size={20} color="white" />
                </View>
              </Tooltip>
            </View>
          )}
          <TouchableOpacity
            hitSlop={20}
            onPress={() => router.push({ pathname: "/settings/advanced" })}
          >
            <View
              style={{
                flexGrow: 1,
              }}
            >
              <Text bold>Advanced Settings</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
