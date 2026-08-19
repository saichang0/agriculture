export const TOKEN_STORAGE_KEY = "agriculture_token";
export const REFRESH_TOKEN_STORAGE_KEY = "agriculture_refresh_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function setTokens(token: string, refreshToken: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}
