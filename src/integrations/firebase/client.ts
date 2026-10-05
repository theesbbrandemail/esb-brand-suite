/**
 * Firebase Auth client — used for Google sign-in (Path B).
 * Supabase remains the database. Enable by setting VITE_FIREBASE_* env vars.
 */
import { initializeApp, type FirebaseApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";

const config = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID as string | undefined,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId,
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function ensureFirebase(): Auth | null {
  if (!isFirebaseConfigured) return null;
  if (typeof window === "undefined") return null;
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(config);
    auth = getAuth(app);
  }
  return auth;
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogleFirebase(): Promise<
  | { user: FirebaseUser; idToken: string; error?: undefined }
  | { user?: undefined; idToken?: undefined; error: Error }
> {
  const a = ensureFirebase();
  if (!a) {
    return { error: new Error("Firebase is not configured. Set VITE_FIREBASE_* environment variables.") };
  }
  try {
    // Prefer popup; fall back to redirect if popup blocked
    let credential;
    try {
      credential = await signInWithPopup(a, googleProvider);
    } catch (popupErr) {
      const msg = popupErr instanceof Error ? popupErr.message : String(popupErr);
      if (/popup|blocked|closed/i.test(msg)) {
        await signInWithRedirect(a, googleProvider);
        // Page will navigate away; caller should treat as redirecting
        return { error: new Error("redirecting") };
      }
      throw popupErr;
    }
    const idToken = await credential.user.getIdToken(true);
    return { user: credential.user, idToken };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}

/** Call on /auth mount to finish redirect-based Google sign-in. */
export async function completeFirebaseRedirectIfAny(): Promise<
  | { user: FirebaseUser; idToken: string }
  | { user?: undefined; idToken?: undefined; error?: Error }
  | null
> {
  const a = ensureFirebase();
  if (!a) return null;
  try {
    const result = await getRedirectResult(a);
    if (!result?.user) return null;
    const idToken = await result.user.getIdToken(true);
    return { user: result.user, idToken };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  const a = ensureFirebase();
  if (!a?.currentUser) return null;
  try {
    return await a.currentUser.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

export function subscribeFirebaseAuth(cb: (user: FirebaseUser | null) => void): () => void {
  const a = ensureFirebase();
  if (!a) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(a, cb);
}

export async function signOutFirebase(): Promise<void> {
  const a = ensureFirebase();
  if (a) await firebaseSignOut(a);
}

export function getFirebaseAuth(): Auth | null {
  return ensureFirebase();
}
