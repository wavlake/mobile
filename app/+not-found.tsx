import { Center } from "@/components";
import { ROUTE_MAPPING } from "@/components/DeepLinkHandler";
import { Unmatched } from "expo-router";
import { useNavigation } from "expo-router";
import { ActivityIndicator } from "react-native";

const CustomUnmatched = () => {
  const navigation = useNavigation();
  const navState = navigation.getState();
  const lastRoute = navState.routes[navState.routes.length - 1];
  const deepLinkPaths = Object.keys(ROUTE_MAPPING);
  const hideUnmatched = deepLinkPaths.some(
    (deeplinkPath) => lastRoute.path?.startsWith(deeplinkPath),
  );

  return hideUnmatched ? (
    <Center>
      <ActivityIndicator />
    </Center>
  ) : (
    <Unmatched />
  );
};

export default CustomUnmatched;
