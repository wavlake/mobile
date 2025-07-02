import {
  signEvent,
  publishEventWithRetry,
  saveCommentEventId,
  getITagFromEvent,
  setToastCallback,
} from "@/utils";
import * as Sentry from "@sentry/react-native";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import { nostrQueryKeys, useNostrEvents } from "@/providers";

const makeKind1Event = (
  pubkey: string,
  content: string,
  tags: string[][] = [],
) => {
  return {
    kind: 1,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content,
  };
};

export const usePublishComment = () => {
  const { cacheEventById } = useNostrEvents();
  const queryClient = useQueryClient();
  const { pubkey, userIsLoggedIn } = useAuth();
  const { writeRelayList } = useNostrRelayList();
  const toast = useToast();

  // Set up toast callback for the publishing utilities
  React.useEffect(() => {
    setToastCallback(toast.show);
  }, [toast.show]);
  const nostrCommentMutation = useMutation({
    mutationFn: async (newCommentEvent: Event) => {
      Sentry.addBreadcrumb({
        message: "Publishing Nostr comment event",
        category: "nostr.comment",
        level: "info",
        data: {
          eventId: newCommentEvent.id,
          eventKind: newCommentEvent.kind,
          contentLength: newCommentEvent.content.length,
          tagsCount: newCommentEvent.tags.length,
          relayCount: writeRelayList.length,
        },
      });

      try {
        await publishEventWithRetry(writeRelayList, newCommentEvent);

        Sentry.addBreadcrumb({
          message: "Successfully published Nostr comment",
          category: "nostr.comment.success",
          level: "info",
          data: {
            eventId: newCommentEvent.id,
          },
        });

        return newCommentEvent;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        Sentry.addBreadcrumb({
          message: "Failed to publish Nostr comment",
          category: "nostr.comment.error",
          level: "error",
          data: {
            eventId: newCommentEvent.id,
            error: errorMessage,
          },
        });

        // Show user-friendly error message
        toast.show(
          "⚠️ Having trouble posting your comment. We'll keep trying...",
        );

        throw error;
      }
    },
  });

  const save = async (
    content: string,
    zapRequestEventId: string,
    customTags?: string[][],
  ) => {
    if (!userIsLoggedIn) {
      Sentry.addBreadcrumb({
        message: "Cannot publish comment: user not logged in",
        category: "nostr.comment.auth_error",
        level: "warning",
      });
      return;
    }

    Sentry.addBreadcrumb({
      message: "Starting comment publish process",
      category: "nostr.comment.save",
      level: "info",
      data: {
        contentLength: content.length,
        zapRequestEventId,
        hasCustomTags: !!customTags,
        customTagsCount: customTags?.length || 0,
      },
    });

    const event = await signEvent(makeKind1Event(pubkey, content, customTags));

    if (!event) {
      const signError = new Error("Failed to sign comment event");
      Sentry.addBreadcrumb({
        message: "Failed to sign comment event",
        category: "nostr.comment.sign_error",
        level: "error",
        data: {
          zapRequestEventId,
          contentLength: content.length,
        },
      });

      toast.show(
        "⚠️ Unable to sign your comment. Please check your Nostr settings.",
      );
      throw signError;
    }

    return new Promise<void>(async (resolve, reject) => {
      try {
        await nostrCommentMutation.mutateAsync(event);

        // save the event to the cache so we dont need to fetch it
        cacheEventById(event);
        const contentId = getITagFromEvent(event);

        if (contentId) {
          const queryKey = nostrQueryKeys.iTagComments(contentId);
          // manually add this new event ID to the cache
          const oldCache = queryClient.getQueryData(queryKey) as string[];
          queryClient.setQueryData(queryKey, [...oldCache, event.id]);
        }

        // save event id to catalog db
        try {
          await saveCommentEventId(event.id, zapRequestEventId);
        } catch (catalogError: any) {
          // Log the catalog API error but don't fail the entire flow
          const errorMessage = catalogError instanceof Error ? catalogError.message : String(catalogError);
          const isNotFoundError = catalogError?.response?.status === 404;
          
          Sentry.addBreadcrumb({
            message: isNotFoundError 
              ? "Comment not found in catalog (timing issue)" 
              : "Failed to save comment to catalog database",
            category: isNotFoundError 
              ? "nostr.comment.catalog_timing" 
              : "nostr.comment.catalog_error",
            level: isNotFoundError ? "info" : "warning",
            data: {
              eventId: event.id,
              zapRequestEventId,
              catalogError: errorMessage,
              statusCode: catalogError?.response?.status,
              // Add more context for debugging
              contentLength: content.length,
              customTagsCount: customTags?.length || 0,
            },
          });
          
          Sentry.withScope((scope) => {
            scope.setTag("api.operation", "save_comment_event_id");
            scope.setTag("api.endpoint", "comments/event-id");
            scope.setTag("api.status_code", catalogError?.response?.status?.toString() || "unknown");
            scope.setLevel(isNotFoundError ? "info" : "error");
            scope.setContext("catalog_api_failure", {
              zapRequestEventId,
              kind1EventId: event.id,
              errorMessage,
              statusCode: catalogError?.response?.status,
              isTimingIssue: isNotFoundError,
              requestUrl: `/comments/event-id/${zapRequestEventId}/${event.id}`,
            });
            Sentry.captureException(catalogError);
          });
          
          console.warn("Failed to save comment to catalog:", {
            zapRequestEventId,
            kind1EventId: event.id,
            error: catalogError
          });
          
          // Still show success to user since Nostr publishing worked
          // The comment exists on Nostr even if catalog linking failed
        }

        Sentry.addBreadcrumb({
          message: "Comment publish process completed successfully",
          category: "nostr.comment.save_success",
          level: "info",
          data: {
            eventId: event.id,
            zapRequestEventId,
          },
        });

        toast.show("✅ Comment posted to Nostr!");
        resolve();
      } catch (error: any) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        Sentry.addBreadcrumb({
          message: "Comment publish process failed",
          category: "nostr.comment.save_error",
          level: "error",
          data: {
            eventId: event.id,
            zapRequestEventId,
            error: errorMessage,
          },
        });

        Sentry.withScope((scope) => {
          scope.setTag("nostr.operation", "publish_comment");
          scope.setTag("zap.request_id", zapRequestEventId);
          scope.setLevel("error");
          scope.setContext("comment_publish_failure", {
            eventId: event.id,
            zapRequestEventId,
            contentLength: content.length,
            customTagsCount: customTags?.length || 0,
            writeRelayCount: writeRelayList.length,
          });
          Sentry.captureException(error);
        });

        // Show user-friendly error message
        toast.show(
          "⚠️ Comment couldn't be posted to Nostr. Your zap was successful!",
        );

        console.error("Comment publish error:", error);
        reject(error);
      }
    });
  };

  return { save, isSaving: nostrCommentMutation.isPending };
};
