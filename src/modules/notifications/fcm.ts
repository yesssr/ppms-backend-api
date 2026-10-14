import { getMessaging, Message, MulticastMessage } from "firebase-admin/messaging";
import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { config } from "../../config/conf.js";

let firebaseApp: App | null = null;

export const initializeFirebase = (): App => {
  if (firebaseApp) return firebaseApp;

  const projectId = config.notifications?.firebaseProjectId;
  const clientEmail = config.notifications?.firebaseClientEmail;
  const privateKey = config.notifications?.firebasePrivateKey?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("[Notifications] Firebase credentials not configured. Push notifications disabled.");
    return null as any;
  }

  firebaseApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return firebaseApp;
};

export const getFirebaseMessaging = () => {
  const app = initializeFirebase();
  if (!app) return null;
  return getMessaging(app);
};

export const sendPushNotification = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: number; failure: number }> => {
  const messaging = getFirebaseMessaging();
  if (!messaging || tokens.length === 0) {
    return { success: 0, failure: 0 };
  }

  const validTokens = tokens.filter((t) => t && t.length > 0);
  if (validTokens.length === 0) {
    return { success: 0, failure: 0 };
  }

  const message: MulticastMessage = {
    tokens: validTokens,
    notification: { title, body },
    data: data || {},
    android: {
      priority: "high",
      notification: { channelId: "default" },
    },
    apns: {
      payload: { aps: { sound: "default", badge: 1 } },
    },
    webpush: {
      headers: { Urgency: "high" },
    },
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    return { success: response.successCount, failure: response.failureCount };
  } catch (error) {
    console.error("[Notifications] FCM send error:", error);
    return { success: 0, failure: validTokens.length };
  }
};

export const sendSinglePushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> => {
  const messaging = getFirebaseMessaging();
  if (!messaging || !token) return false;

  const message: Message = {
    token,
    notification: { title, body },
    data: data || {},
    android: { priority: "high", notification: { channelId: "default" } },
    apns: { payload: { aps: { sound: "default", badge: 1 } } },
    webpush: { headers: { Urgency: "high" } },
  };

  try {
    await messaging.send(message);
    return true;
  } catch (error) {
    console.error("[Notifications] FCM single send error:", error);
    return false;
  }
};