import { AxiosError } from "axios";
import { authAPI } from "@apis/axios.constant";
import Logger from "@core/utils/logger";

export interface UserListItem {
  id: number;
  name?: string;
  [key: string]: unknown;
}

/**
 * Gọi Auth API lấy danh sách user theo list IDs.
 * Endpoint: POST /users/get-list-user
 * Body: { listId: number[] }
 */
export const getListUsersByIds = async (ids: number[], token: string): Promise<Record<number, string>> => {
  if (ids.length === 0) return {};

  try {
    const response = await authAPI(token).post<{ data?: UserListItem[] }>("/users/get-list-user", {
      listId: ids,
    });
    const users = response.data?.data ?? [];
    const map: Record<number, string> = {};
    for (const u of Array.isArray(users) ? users : []) {
      if (u?.id != null && u.name != null) {
        map[u.id] = String(u.name);
      }
    }
    return map;
  } catch (error) {
    const err = error as AxiosError;
    Logger.error("getListUsersByIds failed", err?.response?.data);
    return {};
  }
};
