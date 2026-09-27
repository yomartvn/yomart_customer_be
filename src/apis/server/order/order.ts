import { orderAPI } from "@apis/axios.constant";
import { APIError, handleAxiosError } from "@apis/axios.handle.error";

export const forwardSellerResetOrders = async (params: {
  sellerId: number;
  token: string;
  dryRun: boolean;
  confirm?: string;
  asAdmin: boolean;
}) => {
  const client = orderAPI(params.token);
  const url = params.asAdmin
    ? `admin/sellers/${params.sellerId}/reset-orders`
    : `orders/seller/reset`;

  try {
    const response = await client.post(
      url,
      {
        dry_run: params.dryRun,
        confirm: params.confirm,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${params.token}`,
        },
        timeout: 120000,
      }
    );
    return response.data?.data ?? response.data;
  } catch (error: unknown) {
    const err = handleAxiosError(error as any, "Không thể reset đơn hàng", false) as {
      message?: string;
      status?: number;
      code?: string;
      details?: unknown;
    };
    throw new APIError(err.message || "Không thể reset đơn hàng", err.status, err.code, err.details);
  }
};
