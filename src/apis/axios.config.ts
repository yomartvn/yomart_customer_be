import axios, { AxiosInstance } from "axios";
import { parseEnvInt } from "@core/utils";

interface CreateAxiosOptions {
  baseURL: string;
  token?: string;
  timeout?: number;
  customHeaders?: Record<string, string>;
}

export const createAxiosInstance = ({
  baseURL,
  token,
  timeout = parseEnvInt(process.env.AXIOS_TIMEOUT, 30000),
  customHeaders = {},
}: CreateAxiosOptions): AxiosInstance => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const instance = axios.create({
    baseURL,
    timeout,
    headers,
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      return Promise.reject(err);
    }
  );

  return instance;
};
