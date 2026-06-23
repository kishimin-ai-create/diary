import { create } from "axios";
import type { AxiosRequestConfig } from "axios";

import { readAccessToken } from "@/app/auth";

const axiosInstance = create({ baseURL: "" });

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
export const customInstance = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance<T>(config);
  return response.data;
};

export type ErrorType<Error> = Error;
