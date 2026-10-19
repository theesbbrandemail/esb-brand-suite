import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

// Lightweight client-side WebAuthn flow. Firestore stores the credential allow-list;
// the device's platform authenticator performs the user verification.
const credentialsCollection = "webauthn_credentials";

function requireFirestore() {
  if (!db) throw new Error("Firebase is not configured.");
  return db;
}

const RP_NAME = "ESB Brand · CEO Vault";

function rpId() {
  if (typeof window === "undefined") return "localhost";
  return window.location.hostname;
}

function randomBytes(len = 32) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr;
}

function b64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function isBiometricSupported() {
  return browserSupportsWebAuthn();
}

export async function registerBiometric(opts: {
  userId: string;
  userName: string;
  deviceLabel?: string;
}) {
  const challenge = b64url(randomBytes());
  const userIdBytes = new TextEncoder().encode(opts.userId).slice(0, 64);
  const reg = await startRegistration({
    optionsJSON: {
      rp: { name: RP_NAME, id: rpId() },
      user: {
        id: b64url(userIdBytes),
        name: opts.userName,
        displayName: opts.userName,
      },
      challenge,
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    },
  });

  const firestore = requireFirestore();
  await addDoc(collection(firestore, credentialsCollection), {
    userId: opts.userId,
    credentialId: reg.id,
    publicKey: reg.response.publicKey ?? null,
    transports: reg.response.transports ?? null,
    deviceLabel: opts.deviceLabel ?? navigator.userAgent.slice(0, 80),
    createdAt: serverTimestamp(),
    lastUsedAt: null,
  });
  return reg;
}

export async function authenticateBiometric(userId: string) {
  const firestore = requireFirestore();
  const credentials = await getDocs(
    query(collection(firestore, credentialsCollection), where("userId", "==", userId)),
  );
  const data = credentials.docs.map((item) => ({
    ref: item.ref,
    credentialId: item.get("credentialId") as string,
  }));
  if (data.length === 0) throw new Error("No biometric credentials registered");

  const challenge = b64url(randomBytes());
  const auth = await startAuthentication({
    optionsJSON: {
      challenge,
      rpId: rpId(),
      timeout: 60000,
      userVerification: "required",
      allowCredentials: data.map((c) => ({
        id: c.credentialId,
        type: "public-key",
      })),
    },
  });

  const matched = data.find((item) => item.credentialId === auth.id);
  if (matched) {
    await updateDoc(matched.ref, { lastUsedAt: serverTimestamp() });
  }

  return auth;
}

export async function listCredentials(userId: string) {
  const firestore = requireFirestore();
  const credentials = await getDocs(
    query(
      collection(firestore, credentialsCollection),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    ),
  );
  return credentials.docs.map((item) => ({
    id: item.id,
    device_label: item.get("deviceLabel") as string,
    created_at: item.get("createdAt"),
    last_used_at: item.get("lastUsedAt"),
  }));
}
