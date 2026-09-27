import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@core/utils";
import message from "@core/config/constants";
import { HttpException } from "@core/exceptions";
import { getProfileUser } from "@apis/server/auth/auth";
import { writeCustomerActivityLog } from "@apis/server/activity-log/activity-log";
import ResetCustomersService from "@modules/customer/reset-customers.service";
import { SellerResetCustomersDto } from "@modules/customer/dtos/seller-reset-customers.dto";

export class AdminCustomerController {
  public resetCustomersService = new ResetCustomersService();

  private async ensureSystemAdmin(req: Request, res: Response): Promise<boolean> {
    const token = req.header("Authorization")?.replace("Bearer ", "") as string;
    if (!token) {
      sendResponse(res, 401, "token is required");
      return false;
    }

    try {
      const profile = await getProfileUser(token);
      const isAdminType = String(profile?.type || "").toLowerCase() === "admin";
      if (!isAdminType) {
        sendResponse(res, 403, "Bạn không có quyền thực hiện thao tác này");
        return false;
      }
      return true;
    } catch (error: any) {
      sendResponse(res, 401, error?.message || "token verification failed");
      return false;
    }
  }

  /**
   * Admin hub: preview / hard-reset khách hàng của 1 seller.
   * POST /admin/sellers/:sellerId/reset-customers
   */
  public resetSellerCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!(await this.ensureSystemAdmin(req, res))) {
        return;
      }

      const sellerId = Number(req.params.sellerId);
      if (!Number.isFinite(sellerId) || sellerId <= 0) {
        return sendResponse(res, 400, "sellerId không hợp lệ", null, "sellerId");
      }

      const body = (req.body || {}) as SellerResetCustomersDto;
      const token = req.header("Authorization")?.replace("Bearer ", "") as string;
      const result = await this.resetCustomersService.execute(sellerId, token, "admin", body);

      if (result instanceof HttpException) {
        if (result.field) return sendResponse(res, result.status, result.message, null, result.field);
        return sendResponse(res, result.status, result.message);
      }

      const isDryRun = Boolean((result as any)?.data?.dry_run);
      if (!isDryRun) {
        const data = (result as any)?.data || {};
        writeCustomerActivityLog({
          seller_id: sellerId || 0,
          actor_id: Number(req.id) || undefined,
          actor_type: "admin",
          audience: "platform",
          ip: req.ip || req.socket?.remoteAddress,
          user_agent: req.header("user-agent") || undefined,
          action: "reset",
          action_name: "Reset dữ liệu",
          summary: `Reset khách hàng nhà bán #${sellerId} (${data.deleted_count ?? data.total_customers ?? "?"} KH)`,
          entity_type: "customer",
          entity_id: sellerId,
          entity_code: String(sellerId),
          old_data: {
            total_customers: data.total_customers ?? null,
            address_count: data.address_count ?? null,
            group_count: data.group_count ?? null,
          },
          new_data: data,
        });
      }

      return sendResponse(
        res,
        200,
        isDryRun ? "Xem trước reset khách hàng thành công" : message.DELETE_SUCCESS,
        result
      );
    } catch (error) {
      next(error);
    }
  };
}
