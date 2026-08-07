import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/mock/auth";
import type { AuthUser } from "@/lib/mock/types";

export function useMockAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    setReady(true);
    window.addEventListener("smartbiz-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("smartbiz-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, ready };
}
