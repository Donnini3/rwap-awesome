import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StaffSession {
  staffName: string;
}

interface StaffSessionContextType {
  session: StaffSession | null;
  authReady: boolean;
  signIn: (staffName: string) => void;
  signOut: () => Promise<void>;
}

const StaffSessionContext = createContext<StaffSessionContextType | undefined>(undefined);

const STORAGE_KEY = "kir_staff_session";

const readStoredSession = (): StaffSession | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.staffName ? { staffName: parsed.staffName } : null;
  } catch {
    return null;
  }
};

export const StaffSessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (authSession) {
        setSession(readStoredSession());
      } else {
        setSession(null);
        localStorage.removeItem(STORAGE_KEY);
      }
      setAuthReady(true);
    });

    supabase.auth.getSession()
      .then(({ data: { session: authSession } }) => {
        if (authSession) setSession(readStoredSession());
        else localStorage.removeItem(STORAGE_KEY);
      })
      .catch(() => {
        setSession(null);
        localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setAuthReady(true));

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const signIn = (staffName: string) => setSession({ staffName });

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <StaffSessionContext.Provider value={{ session, authReady, signIn, signOut }}>
      {children}
    </StaffSessionContext.Provider>
  );
};

export const useStaffSession = () => {
  const ctx = useContext(StaffSessionContext);
  if (!ctx) throw new Error("useStaffSession must be used within StaffSessionProvider");
  return ctx;
};
