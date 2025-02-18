import { Event } from "nostr-tools";
import { ViewProps } from "react-native";
import { NostrUserProfile } from "@/utils";

export interface BaseCommentProps {
  comment: Event;
  npubMetadata?: NostrUserProfile | null;
  metadataIsLoading?: boolean;
  closeParent?: () => void;
}

export interface CommentRowProps extends ViewProps {
  commentId?: string;
  comment?: Event;
  isPressable?: boolean;
  showContentDetails?: boolean;
  lastReadDate?: number;
  showReplyParent?: boolean;
  closeParent?: () => void;
  onPress?: (comment: Event) => void;
}

export interface CommentContentProps extends ViewProps, BaseCommentProps {
  isReaction?: boolean;
  associatedContentId?: string | null;
}
