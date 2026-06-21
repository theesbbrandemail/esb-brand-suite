import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";
import { supabase } from "@/integrations/supabase/client";

// Lightweight client-side WebAuthn flow. The Supabase row of credential_ids is the
// allow-list; the device's platform authenticator performs the user verification
// (Touch ID / Windows Hello / Face ID / Android fingerprint).

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

  const { error } = await supabase.from("webauthn_credentials").insert({
    user_id: opts.userId,
    credential_id: reg.id,
    public_key: reg.response.publicKey ?? null,
    transports: reg.response.transports ?? null,
    device_label: opts.deviceLabel ?? navigator.userAgent.slice(0, 80),
  });
  if (error) throw error;
  return reg;
}

export async function authenticateBiometric(userId: string) {
  const { data, error } = await supabase
    .from("webauthn_credentials")
    .select("credential_id")
    .eq("user_id", userId);
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("No biometric credentials registered");

  const challenge = b64url(randomBytes());
  const auth = await startAuthentication({
    optionsJSON: {
      challenge,
      rpId: rpId(),
      timeout: 60000,
      userVerification: "required",
      allowCredentials: data.map((c) => ({
        id: c.credential_id,
        type: "public-key",
      })),
    },
  });

  // Best-effort update last_used_at
  await supabase
    .from("webauthn_credentials")
    .update({ last_used_at: new Date().toISOString() })
    .eq("credential_id", auth.id);

  return auth;
}

export async function listCredentials(userId: string) {
  const { data, error } = await supabase
    .from("webauthn_credentials")
    .select("id, device_label, created_at, last_used_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
