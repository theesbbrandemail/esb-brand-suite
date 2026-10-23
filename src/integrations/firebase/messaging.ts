import { getMessaging, getToken, isSupported, onMessage, type MessagePayload } from "firebase/messaging";
import { firebaseConfig, app, db } from "./client";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

export async function registerFirebaseMessaging(userId: string): Promise<string | null> {
  if (!app || !db || typeof window === "undefined" || !vapidKey) return null;
  if (!(await isSupported())) return null;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;
  const params = new URLSearchParams({
    apiKey: firebaseConfig.apiKey || "",
    authDomain: firebaseConfig.authDomain || "",
    projectId: firebaseConfig.projectId || "",
    storageBucket: firebaseConfig.storageBucket || "",
    messagingSenderId: firebaseConfig.messagingSenderId || "",
    appId: firebaseConfig.appId || "",
  });
  const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params.toString()}`);
  const token = await getToken(getMessaging(app), { vapidKey, serviceWorkerRegistration: registration });
  if (!token) return null;
  await setDoc(doc(collection(db, "fcm_tokens"), token), {
    token,
    userId,
    platform: navigator.userAgent,
    updatedAt: serverTimestamp(),
  });
  return token;
}

export async function subscribeToForegroundMessages(handler: (payload: MessagePayload) => void): Promise<() => void> {
  if (!app || typeof window === "undefined" || !(await isSupported())) return () => {};
  return onMessage(getMessaging(app), handler);
}

export { firebaseConfig };
