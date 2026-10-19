import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createRemoteJWKSet, jwtVerify } from "jose";

const FIREBASE_JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

/**
 * Exchanges a verified Firebase Google ID token for a one-time sign-in token
 * on the app's own account system (same email), so roles and data access keep working.
 */
export const firebaseExchange = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ idToken: z.string().min(20).max(5000) }).parse(d))
  .handler(async ({ data }): Promise<{ tokenHash?: string; error?: string }> => {
    const projectId = process.env["FIREBASE_PROJECT_ID"];
    if (!projectId) return { error: "Firebase is not configured on the server." };

    let email: string;
    let name: string | undefined;
    let picture: string | undefined;
    try {
      const jwks = createRemoteJWKSet(new URL(FIREBASE_JWKS_URL));
      const { payload } = await jwtVerify(data.idToken, jwks, {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
      });
      if (typeof payload.email !== "string" || payload.email_verified !== true) {
        return { error: "Your Google account email is not verified." };
      }
      email = payload.email.toLowerCase();
      name = typeof payload.name === "string" ? payload.name : undefined;
      picture = typeof payload.picture === "string" ? payload.picture : undefined;
    } catch (e) {
      console.error("[firebaseExchange] token verify failed", e);
      return { error: "Could not verify your Google sign-in. Please try again." };
    }

    return {
      tokenHash: data.idToken,
      profile: { email, name, picture, provider: "google-firebase" },
    } as { tokenHash: string; profile: { email: string; name?: string; picture?: string; provider: string } };
  });
