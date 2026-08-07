import type { AuthUser } from "./types";

// Temporary mock authentication. Swap for the real auth provider later.
const STORAGE_KEY = "smartbiz.auth.user";

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function mockSignIn(email: string): AuthUser {
  const user: AuthUser = {
    id: "mock-user",
    name: email.split("@")[0]?.replace(/[._-]/g, " ") || "Owner",
    email,
    role: "admin",
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("smartbiz-auth"));
  return user;
}

export function mockSignOut() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("smartbiz-auth"));
}
