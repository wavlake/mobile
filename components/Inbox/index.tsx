import { PillTabView } from "../PillTabView";
import { ContentTab } from "./ContentTab";
import { NonContentTab } from "./NonContentTab";
import { useInbox } from "@/hooks";
import { useEffect } from "react";

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
    // update last read date on mount
    updateLastRead();
  }, []);

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
