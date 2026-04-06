import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";
import { PersistedData } from "@/store/useGTDStore";

const USERS_COLLECTION = "users";

/**
 * Ensures the auth token is fresh before making Firestore calls.
 * Firebase sometimes hasn't propagated the token to Firestore yet
 * immediately after onAuthStateChanged fires.
 */
async function ensureAuthReady(): Promise<void> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    await user.getIdToken(false); // reuse existing token, force=false is enough
  }
}

/**
 * Load a user's data from Firestore.
 * Returns null if the user has no document yet (new user).
 */
export async function loadUserDataFromFirestore(uid: string): Promise<Partial<PersistedData> | null> {
  try {
    await ensureAuthReady();
    const ref = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as Partial<PersistedData>;
    }
    return null;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      // Retry once after a short delay — token may not have propagated yet
      await new Promise(r => setTimeout(r, 1500));
      try {
        const ref = doc(db, USERS_COLLECTION, uid);
        const snap = await getDoc(ref);
        return snap.exists() ? (snap.data() as Partial<PersistedData>) : null;
      } catch {
        return null;
      }
    }
    console.error("[Firestore] Error loading user data:", err);
    return null;
  }
}

/**
 * Save a user's data to Firestore (merge so we never wipe keys we don't touch).
 */
export async function saveUserDataToFirestore(uid: string, data: Partial<PersistedData>): Promise<void> {
  try {
    const ref = doc(db, USERS_COLLECTION, uid);
    // Sanitize data to remove any `undefined` values which crash Firestore
    const sanitizedData = JSON.parse(JSON.stringify(data));
    await setDoc(ref, sanitizedData, { merge: true });
  } catch (err) {
    console.error("[Firestore] Error saving user data:", err);
  }
}
