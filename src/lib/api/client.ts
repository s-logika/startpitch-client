import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/auth/token-storage";
import type { AuthTokens } from "@/types/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type AuthExpiredHandler = () => void;
let authExpiredHandler: AuthExpiredHandler | null = null;

export function setAuthExpiredHandler(handler: AuthExpiredHandler | null): void {
  authExpiredHandler = handler;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
  /** Send this exact bearer token instead of the stored access token (used for refresh). */
  overrideToken?: string;
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.clone().json();
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.msg === "string") return data.msg;
  } catch {
    // response wasn't JSON (e.g. an unhandled 500 HTML page)
  }
  return `Request failed with status ${res.status}`;
}

let refreshPromise: Promise<AuthTokens | null> | null = null;

async function refreshTokens(): Promise<AuthTokens | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        if (!res.ok) return null;
        const tokens = (await res.json()) as AuthTokens;
        setTokens(tokens);
        return tokens;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, overrideToken, headers, ...rest } = options;

  const doFetch = async (token: string | null) => {
    const finalHeaders: Record<string, string> = {
      Accept: "application/json",
      ...(headers as Record<string, string> | undefined),
    };
    if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
    if (token) finalHeaders.Authorization = `Bearer ${token}`;

    return fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  const token = skipAuth ? null : overrideToken ?? getAccessToken();
  let res = await doFetch(token);

  if (res.status === 401 && !skipAuth && !overrideToken) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      res = await doFetch(refreshed.access_token);
    } else {
      clearTokens();
      authExpiredHandler?.();
      throw new ApiError(401, "Your session has expired. Please sign in again.");
    }
  }

  if (!res.ok) {
    const message = await extractErrorMessage(res);
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
