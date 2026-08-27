"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface ClientSession {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    roles: string[];
    platformRoles: string[];
  };
}

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionContextValue {
  data: ClientSession | null;
  status: SessionStatus;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function AscenciaSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<ClientSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`session ${response.status}`);
      const body = (await response.json()) as {
        authenticated: boolean;
        session?: ClientSession;
      };
      setData(body.authenticated ? (body.session ?? null) : null);
      setStatus(body.authenticated ? "authenticated" : "unauthenticated");
    } catch {
      setData(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ data, status, refresh }),
    [data, status, refresh],
  );
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useAscenciaSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error(
      "useAscenciaSession doit être utilisé dans AscenciaSessionProvider.",
    );
  }
  return value;
}

export function signOut(global = true): void {
  window.location.assign(`/api/auth/signout${global ? "?global=1" : ""}`);
}
