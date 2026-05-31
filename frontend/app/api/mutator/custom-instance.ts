import Axios from "axios";
import type { AxiosRequestConfig } from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

const axiosInstance = Axios.create({ baseURL: BACKEND_URL });

/**
 * Custom Axios instance used by Orval-generated API clients.
 * Automatically injects the backend base URL and handles response unwrapping.
 */
export const customInstance = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const { data } = await axiosInstance(config);
  return data as T;
};

export type ErrorType<Error> = Error;
