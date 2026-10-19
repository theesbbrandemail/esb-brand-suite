import { collection, doc, getDocs, updateDoc, where, query, type DocumentData } from "firebase/firestore";
import { db, signOutFirebase } from "@/integrations/firebase/client";

class FirebaseQuery {
  private collectionName: string;
  private filters: ReturnType<typeof where>[] = [];
  private updates: Record<string, unknown> | null = null;
  constructor(collectionName: string) { this.collectionName = collectionName; }
  select(_fields?: string) { return this; }
  eq(field: string, value: unknown) { this.filters.push(where(field, "==", value)); return this; }
  order(_field: string, _options?: unknown) { return this; }
  limit(_count: number) { return this; }
  update(values: Record<string, unknown>) { this.updates = values; return this; }
  async then(resolve: (value: { data: DocumentData[] | null; error: Error | null }) => unknown) {
    if (!db) return resolve({ data: [], error: new Error("Firebase is not configured") });
    try {
      if (this.updates) {
        const snapshot = await getDocs(query(collection(db, this.collectionName), ...this.filters));
        await Promise.all(snapshot.docs.map((item) => updateDoc(doc(db!, this.collectionName, item.id), this.updates!)));
        return resolve({ data: [], error: null });
      }
      const snapshot = await getDocs(query(collection(db, this.collectionName), ...this.filters));
      return resolve({ data: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })), error: null });
    } catch (error) { return resolve({ data: null, error: error as Error }); }
  }
}

export const supabase = {
  auth: { signOut: async () => { await signOutFirebase(); return { error: null }; }, verifyOtp: async () => ({ error: new Error("Email OTP is not enabled; use Google sign-in.") }) },
  from: (name: string) => new FirebaseQuery(name),
  channel: (_name: string) => ({ on: () => ({ subscribe: () => ({}) }) }),
  removeChannel: async (_channel: unknown) => undefined,
};
