"use client";

import { useSyncExternalStore } from "react";

const ACCESS_TOKEN_KEY = "daybook.accessToken";

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
