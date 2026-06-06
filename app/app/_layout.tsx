import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState } from "react-native";
import { KoalaStoreProvider } from "../data/store";

export default function RootLayout() {
  useNotificationDebugLogs();

  return (
    <KoalaStoreProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </KoalaStoreProvider>
  );
}

function useNotificationDebugLogs() {
  useEffect(() => {
    try {
      const Notifications = require("expo-notifications") as {
        addNotificationReceivedListener?: (listener: (notification: NotificationDebugPayload) => void) => { remove: () => void };
        addNotificationResponseReceivedListener?: (listener: (response: { notification: NotificationDebugPayload }) => void) => { remove: () => void };
        getLastNotificationResponse?: () => { notification?: NotificationDebugPayload } | null;
        getPresentedNotificationsAsync?: () => Promise<NotificationDebugPayload[]>;
      };
      const appStateSubscription = AppState.addEventListener("change", (nextState) => {
        debugNotification("app state changed", { nextState });

        if (nextState === "active") {
          void logPresentedNotifications(Notifications);
        }
      });
      const receivedSubscription = Notifications.addNotificationReceivedListener?.((notification) => {
        debugNotification("received while app active", notificationDebugDetails(notification));
      });
      const responseSubscription = Notifications.addNotificationResponseReceivedListener?.((response) => {
        debugNotification("response tapped", notificationDebugDetails(response.notification));
      });
      const lastResponse = Notifications.getLastNotificationResponse?.();

      if (lastResponse?.notification) {
        debugNotification("last response on launch", notificationDebugDetails(lastResponse.notification));
      }

      debugNotification("listeners registered", {
        hasReceivedListener: Boolean(receivedSubscription),
        hasResponseListener: Boolean(responseSubscription)
      });

      return () => {
        receivedSubscription?.remove();
        responseSubscription?.remove();
        appStateSubscription.remove();
      };
    } catch (error) {
      debugNotification("listeners unavailable", { error: readableError(error) });
      return undefined;
    }
  }, []);
}

async function logPresentedNotifications(Notifications: {
  getPresentedNotificationsAsync?: () => Promise<NotificationDebugPayload[]>;
}) {
  if (!Notifications.getPresentedNotificationsAsync) {
    debugNotification("presented notification scan unavailable", {});
    return;
  }

  try {
    const notifications = await Notifications.getPresentedNotificationsAsync();
    debugNotification("presented notification scan", {
      count: notifications.length,
      notifications: notifications.map(notificationDebugDetails)
    });
  } catch (error) {
    debugNotification("presented notification scan failed", { error: readableError(error) });
  }
}

type NotificationDebugPayload = {
  request?: {
    content?: {
      body?: string | null;
      data?: Record<string, unknown>;
      sound?: boolean | string | null;
      title?: string | null;
    };
    identifier?: string;
    trigger?: unknown;
  };
};

function notificationDebugDetails(notification: NotificationDebugPayload) {
  return {
    body: notification.request?.content?.body,
    data: notification.request?.content?.data,
    identifier: notification.request?.identifier,
    sound: notification.request?.content?.sound,
    title: notification.request?.content?.title,
    trigger: notification.request?.trigger
  };
}

function debugNotification(message: string, data?: Record<string, unknown>) {
  console.log(`[Notification] ${message}`, data ?? {});
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
