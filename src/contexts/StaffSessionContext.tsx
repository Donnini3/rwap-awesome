import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface StaffSession {
  staffName: string;
  eventId: string;
  eventName: string;
}

interface StaffSessionContextType {
  session: StaffSession | null;
  signIn: (staffName: string, eventId: string, eventName: string) => void;
  signOut: () => void;
}

const StaffSessionContext = createContext<StaffSessionContextType | undefined>(undefined);

const STORAGE_KEY = "kir_staff_session";

export const StaffSessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<StaffSession | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const signIn = (staffName: string, eventId: string, eventName: string) => {
    setSession({ staffName, eventId, eventName });
  };

  const signOut = () => setSession(null);

  return (
    <StaffSessionContext.Provider value={{ session, signIn, signOut }}>
      {children}
    </StaffSessionContext.Provider>
  );
};

export const useStaffSession = () => {
  const ctx = useContext(StaffSessionContext);
  if (!ctx) throw new Error("useStaffSession must be used within StaffSessionProvider");
  return ctx;
};
