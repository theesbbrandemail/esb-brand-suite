import { createMiddleware } from "@tanstack/react-start";
import { getFirebaseAuth } from "./client";

export const requireFirebaseAuth = createMiddleware().server(async ({ next }) => {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) {
    throw new Error("Authentication required");
  }
  return next({ context: { firebaseUser: auth.currentUser } });
});

export const requireGoogleAuth = requireFirebaseAuth;
