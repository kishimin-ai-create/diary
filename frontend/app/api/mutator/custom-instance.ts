import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

const axiosInstance = axios.create({ baseURL: BACKEND_URL });

/**
 * Custom Axios instance used by Orval-generated API clients.
 * Automatically injects the backend base URL and handles response unwrapping.
 */
export const customInstance = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance<T>(config);
  return response.data;
};

export type ErrorType<Error> = Error;
