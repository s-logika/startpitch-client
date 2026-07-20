import Cookies from "js-cookie";

// Access/refresh tokens live in localStorage (this API is header-based JWT, not
// cookie-based). A separate lightweight, non-sensitive cookie is mirrored purely
// so the Next.js middleware can gate /dashboard routes without a content flash.
const ACCESS_TOKEN_KEY = "sp_access_token";
const REFRESH_TOKEN_KEY = "sp_refresh_token";
const SESSION_FLAG_COOKIE = "sp_session";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: { access_token: string; refresh_token: string }): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  Cookies.set(SESSION_FLAG_COOKIE, "1", { sameSite: "lax", expires: 7 });
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  Cookies.remove(SESSION_FLAG_COOKIE);
}
