import { AxiosError } from "axios";
import { sellerAPI } from "@apis/axios.constant";
import Logger from "@core/utils/logger";

/**
 * Gọi Seller API (server seller khác src, db) để kiểm tra seller_id có tồn tại không.
 * Endpoint: GET /seller/get-by-id/:id
 */
export const checkSellerExists = async (sellerId: number, token?: string): Promise<boolean> => {
  try {
    const response = await sellerAPI(token).get<{ data?: { id: number } }>(`/seller/check-exists/${sellerId}`);
    return !!(response.data?.data?.id);
  } catch (error) {
    const err = error as AxiosError;
    const status = err?.response?.status;
    if (status === 404) return false;
    Logger.error("checkSellerExists failed", err?.response?.data);
    return false;
  }
};
