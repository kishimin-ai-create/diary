import { create } from "axios";
import type { AxiosRequestConfig } from "axios";

import { readAccessToken } from "@/app/auth";

const axiosInstance = create({ baseURL: "" });
const RETRYABLE_STATUSES = new Set([502, 503, 504]);
const DEFAULT_RETRY_OPTIONS = {
  delayMs: 3_000,
  maxAttempts: 20,
};

interface RetryOptions {
  delayMs: number;
  maxAttempts: number;
}

axiosInstance.interceptors.request.use((config) => {
  const accessToken = readAccessToken();
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

/**
 * Custom Axios instance used by Orval-generated API clients.
 * Automatically injects the backend base URL and handles response unwrapping.
 */
export const customInstance = async <T>(
  config: AxiosRequestConfig,
  retryOptions: RetryOptions = DEFAULT_RETRY_OPTIONS,
): Promise<T> => {
  let attempt = 1;

  for (;;) {
    try {
      const response = await axiosInstance<T>(config);
      return response.data;
    } catch (error) {
      if (attempt >= retryOptions.maxAttempts || !shouldRetryRequest(error)) {
        throw error;
      }

      attempt += 1;
      await wait(retryOptions.delayMs);
    }
  }
};

export type ErrorType<Error> = Error;

function shouldRetryRequest(error: unknown): boolean {
  const status = readHttpStatus(error);
  if (status !== undefined) {
    return RETRYABLE_STATUSES.has(status);
  }

  if (error instanceof TypeError) {
    return true;
  }

  if (!isRecord(error)) {
    return false;
  }

  return (
    error["code"] === "ERR_NETWORK" ||
    error["code"] === "ECONNABORTED" ||
    error["request"] !== undefined
  );
}

function readHttpStatus(error: unknown): number | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  const response = error["response"];
  if (!isRecord(response)) {
    return undefined;
  }

  const status = response["status"];
  if (typeof status !== "number") {
    return undefined;
  }

  return status;
}

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === "object" && value !== null;
}

function wait(delayMs: number): Promise<void> {
  if (delayMs <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}
