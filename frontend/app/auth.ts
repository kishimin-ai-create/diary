"use client";

import { useSyncExternalStore } from "react";

const ACCESS_TOKEN_KEY = "daybook.accessToken";
const REFRESH_TOKEN_KEY = "daybook.refreshToken";

/**
 * Reads the admin access token from tab-scoped browser storage.
 */
export function readAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Persists the admin access token for the current browser tab.
 */
export function saveAccessToken(accessToken: string): void {
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.dispatchEvent(new StorageEvent("storage", { key: ACCESS_TOKEN_KEY }));
}

/**
 * Clears the admin access token for the current browser tab.
 */
export function clearAccessToken(): void {
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new StorageEvent("storage", { key: ACCESS_TOKEN_KEY }));
}

/**
 * Reads the admin refresh token from tab-scoped browser storage.
 */
export function readRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Persists the admin refresh token for the current browser tab.
 */
export function saveRefreshToken(refreshToken: string): void {
  window.sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Clears the admin refresh token for the current browser tab.
 */
export function clearRefreshToken(): void {
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Clears both the access token and refresh token, effectively ending the session.
 */
export function clearSession(): void {
  clearRefreshToken();
  clearAccessToken();
}

/**
 * Subscribes components to token changes without mirroring storage in effects.
 */
export function useAccessToken(): string | null {
  return useSyncExternalStore(subscribeToTokenChanges, readAccessToken, getServerToken);
}

function subscribeToTokenChanges(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getServerToken(): string | null {
  return null;
}
