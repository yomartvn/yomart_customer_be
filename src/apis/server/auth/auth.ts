import { AxiosError } from "axios";
import { authAPI } from "@apis/axios.constant";
import { APIError, handleAxiosError } from "@apis/axios.handle.error";
import messages from "@core/config/constants";
import Logger from "@core/utils/logger";
import { AuthVerifyResponse } from "./interface";

export type VerifyTokenResult =
  | { ok: true; user: AuthVerifyResponse }
  | { ok: false; status: number; message: string };

/**
 * Gọi API auth server để xác thực token.
 * Auth server endpoint: GET /auth/verify-token
 * Response mẫu: { data: { id, active, role_ids } }
 */
export const verifyToken = async (token: string): Promise<VerifyTokenResult> => {
  try {
    const response = await authAPI(token).get<{ data?: AuthVerifyResponse }>("/auth/verify-token");
    const user = response.data?.data;
    if (!user?.id) {
      return { ok: false, status: 401, message: messages.INVALID_TOKEN };
    }
    return { ok: true, user };
  } catch (error) {
    const err = error as AxiosError;
    Logger.error("verifyToken failed", err?.response?.data);
    if (error instanceof APIError) {
      return { ok: false, status: error.status ?? 401, message: error.message || messages.INVALID_TOKEN };
    }
    const status = err.response?.status ?? 401;
    const apiMessage =
      typeof err.response?.data === "object" && err.response?.data !== null && "message" in err.response.data
        ? (err.response.data as { message?: string }).message
        : undefined;
    return { ok: false, status, message: apiMessage || messages.INVALID_TOKEN };
  }
};

export const getProfileUser = async (token: string) => {
  try {
    const response = await authAPI(token).get("auth/get-profile");
    return response.data?.data ?? null;
  } catch (error) {
    const err = handleAxiosError(error as AxiosError, messages.CANNOT_FETCH_PROFILE, false) as {
      message?: string;
    };
    throw new Error(err.message || messages.CANNOT_FETCH_PROFILE);
  }
};
