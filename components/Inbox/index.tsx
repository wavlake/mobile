import { PillTabView } from "@/components";
import { ContentTab } from "./ContentTab";
import { NonContentTab } from "./NonContentTab";
import { useInbox } from "@/hooks";
import { Event } from "nostr-tools";
import { useEffect } from "react";

export const InboxPage = () => {
  const {
    updateLastRead,
    directReplies,
    contentReplies,
    isLoading,
    refetch,
    userHasContent,
    lastReadDate,
  } = useInbox();

  useEffect(() => {
    // update last read date on mount
    updateLastRead();
  }, []);

  const mentions: Event[] = [];
  return userHasContent ? (
    <PillTabView tabNames={["Wavlake", "Other"]}>
      <PillTabView.Item style={{ width: "100%" }}>
        <ContentTab
          data={contentReplies}
          isLoading={isLoading}
          refetch={refetch}
          lastReadDate={lastReadDate}
        />
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <NonContentTab
          data={[...mentions, ...directReplies]}
          isLoading={isLoading}
          refetch={refetch}
          lastReadDate={lastReadDate}
        />
      </PillTabView.Item>
    </PillTabView>
  ) : (
    <NonContentTab
      data={[...mentions, ...directReplies]}
      isLoading={isLoading}
      refetch={refetch}
      lastReadDate={lastReadDate}
    />
  );
};
