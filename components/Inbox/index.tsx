import { PillTabView } from "@/components";
import { ContentTab } from "./ContentTab";
import { NonContentTab } from "./NonContentTab";
import { useInbox } from "@/hooks";
import { Event } from "nostr-tools";

export const InboxPage = () => {
  const { lastReadDate, directReplies, contentReplies, isLoading, refetch } =
    useInbox();

  const mentions: Event[] = [];
  return (
    <PillTabView tabNames={["Wavlake", "Other"]}>
      <PillTabView.Item style={{ width: "100%" }}>
        <ContentTab
          data={contentReplies}
          isLoading={isLoading}
          refetch={refetch}
        />
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <NonContentTab
          data={[...mentions, ...directReplies]}
          isLoading={isLoading}
          refetch={refetch}
        />
      </PillTabView.Item>
    </PillTabView>
  );
};
