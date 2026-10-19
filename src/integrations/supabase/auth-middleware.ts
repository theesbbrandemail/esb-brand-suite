import { getFirebaseIdToken } from "@/integrations/firebase/client";

export async function requireSupabaseAuth({ next, context }: { next: () => unknown; context: Record<string, unknown> }) {
  const token = await getFirebaseIdToken();
  if (!token) throw new Error("Authentication required");
  context.userId = "firebase-user";
  context.firebaseToken = token;
  return next();
}
