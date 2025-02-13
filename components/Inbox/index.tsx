import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { PillTabView } from "../PillTabView";
import { ContentTab } from "./ContentTab";
import { NonContentTab } from "./NonContentTab";
import { useInbox } from "@/hooks";
import { Center } from "../shared/Center";

export const InboxPage = () => {
  const {
    updateLastRead,
    comments,
    contentComments,
    reactions,
    zapReceipts,
    isLoading,
    refetch,
    userHasContent,
    lastReadDate,
  } = useInbox();

  useEffect(() => {
    updateLastRead();
  }, []);

  if (isLoading) {
    return (
      <Center>
        <ActivityIndicator size="large" />
      </Center>
    );
  }

  return userHasContent ? (
    <PillTabView tabNames={["Wavlake", "Other"]}>
      <PillTabView.Item style={{ width: "100%" }}>
        <ContentTab
          data={contentComments}
          isLoading={isLoading}
          refetch={refetch}
          lastReadDate={lastReadDate}
        />
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <NonContentTab
          comments={comments}
          reactions={reactions}
          zapReceipts={zapReceipts}
          isLoading={isLoading}
          refetch={refetch}
          lastReadDate={lastReadDate}
        />
      </PillTabView.Item>
    </PillTabView>
  ) : (
    <NonContentTab
      comments={comments}
      reactions={reactions}
      zapReceipts={zapReceipts}
      isLoading={isLoading}
      refetch={refetch}
      lastReadDate={lastReadDate}
    />
  );
};
