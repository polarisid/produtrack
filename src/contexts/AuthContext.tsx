"use client";

import * as React from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useGTDStore, PersistedData } from "@/store/useGTDStore";
import { loadUserDataFromFirestore, saveUserDataToFirestore } from "@/lib/firestoreService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isHydrated: boolean;
}

const AuthContext = React.createContext<AuthContextType>({ user: null, loading: true, isHydrated: false });

// Fields to persist (not transient modal state)
const PERSISTED_KEYS: (keyof PersistedData)[] = [
  'inbox', 'tasks', 'projects', 'habits', 'contexts', 'hasSeenOnboarding'
];

function extractPersistedData(state: ReturnType<typeof useGTDStore.getState>): Partial<PersistedData> {
  const out: Partial<PersistedData> = {};
  PERSISTED_KEYS.forEach(k => {
    (out as any)[k] = (state as any)[k];
  });
  return out;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    let unsubscribeStore: (() => void) | null = null;
    let saveTimer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Cleanup previous user subscriptions
      if (unsubscribeStore) {
        unsubscribeStore();
        unsubscribeStore = null;
      }
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }

      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // --- Load this user's data from Firestore ---
        const cloudData = await loadUserDataFromFirestore(currentUser.uid);

        if (cloudData) {
          // Existing user — hydrate with their cloud data
          useGTDStore.getState().hydrate(cloudData);
        } else {
          // Brand new user — start with fresh empty state
          useGTDStore.getState().resetToEmpty();
        }
        // Mark hydration as complete AFTER store is populated
        setIsHydrated(true);

        // --- Subscribe to store and debounce-save to Firestore ---
        unsubscribeStore = useGTDStore.subscribe((state) => {
          if (saveTimer) clearTimeout(saveTimer);
          saveTimer = setTimeout(() => {
            const data = extractPersistedData(state);
            saveUserDataToFirestore(currentUser.uid, data);
          }, 300); // debounce: save 300ms after last change to avoid data loss on reload
        });

        // Route guard
        if (pathname === "/login") {
          router.push("/");
        }
      } else {
        // Logged out — clear in-memory store
        useGTDStore.getState().resetToEmpty();
        setIsHydrated(false);

        if (pathname !== "/login") {
          router.push("/login");
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeStore) unsubscribeStore();
      if (saveTimer) clearTimeout(saveTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isHydrated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => React.useContext(AuthContext);
