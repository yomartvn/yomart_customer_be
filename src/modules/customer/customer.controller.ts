import CustomerServices from "./customer.service";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@core/utils";
import { HttpException } from "@core/exceptions";
import { CreateDto } from "./dtos/create.dto";
import { UpdateDto } from "./dtos/update.dto";
import message from "@core/config/constants";
import { SearchDto } from "./dtos/search.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateByRegisterDto } from "./dtos/create-by-register.dto";
import { UpdateFromProfileByIDDto } from "./dtos/update-from-profile-by-id.dto";
import { writeCustomerActivityLog } from "@apis/server/activity-log/activity-log";
import {
  getCustomerAddressSnapshotForLog,
  getCustomerSnapshotForLog,
} from "./utils/activity-log-snapshot";
import { getProfileUser } from "@apis/server/auth/auth";
import { SellerResetCustomersDto } from "./dtos/seller-reset-customers.dto";
import ResetCustomersService from "./reset-customers.service";

class CustomerController {
  public customerServices = new CustomerServices();
  public resetCustomersService = new ResetCustomersService();

  private activityMeta = (req: Request) => ({
    seller_id: Number(req.seller_id) || 0,
    actor_id: Number(req.id) || undefined,
    ip: req.ip || req.socket?.remoteAddress,
    user_agent: req.header("user-agent") || undefined,
  });

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    const searchDto = plainToInstance(SearchDto, req.query);
    const errors = await validate(searchDto);
    if (errors.length > 0) return sendResponse(res, 400, message.VALIDATION_FAILED, errors);

    const seller_id = req.seller_id;
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      const result = await this.customerServices.getAll(searchDto, seller_id, token);
      if (result instanceof HttpException)
        return sendResponse(res, result.status, result.message);
      return sendResponse(res, 200, message.SEARCH_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  public getStats = async (req: Request, res: Response, next: NextFunction) => {
    const seller_id = Number(req.seller_id);
    const from_date = req.query.from_date as string | undefined;
    const to_date = req.query.to_date as string | undefined;
    try {
      const result = await this.customerServices.getNewCustomerStats(seller_id, from_date, to_date);
      if (result instanceof HttpException)
        return sendResponse(res, result.status, result.message);
      return sendResponse(res, 200, message.SEARCH_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return sendResponse(res, 400, message.INVALID_ID);
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      const result = await this.customerServices.getById(id, token);
      if (result instanceof HttpException)
        return sendResponse(res, result.status, result.message);
      return sendResponse(res, 200, message.FIND_BY_ID_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    const seller_id = req.seller_id;
    if (seller_id == null || seller_id === undefined) {
      return sendResponse(res, 403, "Bạn cần thuộc seller để tạo khách hàng");
    }
    const model: CreateDto = req.body as CreateDto;
    const create_id = req.id !== undefined ? req.id : 0;
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      const result = await this.customerServices.create(model, create_id, seller_id, token);
      if (result instanceof Error && (result as any).field)
        return sendResponse(res, (result as any).status, (result as any).message, null, (result as any).field);
      if (result instanceof Error)
        return sendResponse(res, (result as any).status, (result as any).message);
      if (result?.errors) {
        return sendResponse(res, result.statusCode, result.message, null, null, result.errors);
      }

      const customerId = Number(result?.data?.id) || 0;
      const snapshot =
        (customerId > 0 ? await getCustomerSnapshotForLog(customerId) : null) || result?.data || null;
      writeCustomerActivityLog({
        ...this.activityMeta(req),
        seller_id: Number(seller_id) || Number(snapshot?.seller_id) || 0,
        action: "create",
        action_name: "Tạo mới",
        summary: `Tạo khách hàng ${snapshot?.code || snapshot?.name || customerId}`.trim(),
        entity_type: "customer",
        entity_id: customerId || result?.data?.id,
        entity_code: snapshot?.code || result?.data?.code || undefined,
        old_data: null,
        new_data: snapshot,
      });

      const addressId = Number(result?.data?.address?.id) || 0;
      if (addressId > 0) {
        const addressSnap = await getCustomerAddressSnapshotForLog(addressId);
        writeCustomerActivityLog({
          ...this.activityMeta(req),
          seller_id: Number(seller_id) || Number(addressSnap?.seller_id) || 0,
          action: "create",
          action_name: "Tạo mới",
          summary: `Tạo địa chỉ ${addressSnap?.name || addressId} (KH ${addressSnap?.customer_code || snapshot?.code || ""})`.trim(),
          entity_type: "customer_address",
          entity_id: addressId,
          entity_code: addressSnap?.customer_code || snapshot?.code || undefined,
          old_data: null,
          new_data: addressSnap,
        });
      }

      return sendResponse(res, 200, message.CREATE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  public createByRegister = async (req: Request, res: Response, next: NextFunction) => {
    const seller_id = req.seller_id;
    if (seller_id == null || seller_id === undefined) {
      return sendResponse(res, 403, "Bạn cần thuộc seller để tạo khách hàng");
    }
    const model: CreateByRegisterDto = req.body as CreateByRegisterDto;
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      const result = await this.customerServices.createByRegister(model, seller_id, token);
      if (result instanceof Error && (result as any).field)
        return sendResponse(res, (result as any).status, (result as any).message, null, (result as any).field);
      if (result instanceof Error)
        return sendResponse(res, (result as any).status, (result as any).message);
      if (result?.errors) {
        return sendResponse(res, result.statusCode, result.message, null, null, result.errors);
      }
      return sendResponse(res, 200, message.CREATE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  public updateFromProfileByID = async (req: Request, res: Response, next: NextFunction) => {
    const customerId = parseInt(req.params.id, 10);
    if (isNaN(customerId)) return sendResponse(res, 400, message.INVALID_ID);

    const model: UpdateFromProfileByIDDto = req.body as UpdateFromProfileByIDDto;
    try {
      const result = await this.customerServices.updateFromProfileByID(model, customerId);
      if (result instanceof Error && (result as any).field)
        return sendResponse(res, (result as any).status, (result as any).message, null, (result as any).field);
      if (result instanceof Error)
        return sendResponse(res, (result as any).status, (result as any).message);
      if (result?.errors) {
        return sendResponse(res, result.statusCode, result.message, null, null, result.errors);
      }
      return sendResponse(res, 200, message.UPDATE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    const model: UpdateDto = req.body as UpdateDto;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return sendResponse(res, 400, message.INVALID_ID);
    const create_id = req.id;
    try {
      const oldSnap = await getCustomerSnapshotForLog(id);
      const result = await this.customerServices.update(model, id, create_id);
      if (result instanceof Error && (result as any).field)
        return sendResponse(res, (result as any).status, (result as any).message, null, (result as any).field);
      if (result instanceof Error)
        return sendResponse(res, (result as any).status, (result as any).message);
      if (result?.errors) {
        return sendResponse(res, result.statusCode, result.message, null, null, result.errors);
      }

      const newSnap = await getCustomerSnapshotForLog(id);
      writeCustomerActivityLog({
        ...this.activityMeta(req),
        seller_id: Number(req.seller_id) || Number(newSnap?.seller_id) || Number(oldSnap?.seller_id) || 0,
        action: "update",
        action_name: "Cập nhật",
        summary: `Cập nhật khách hàng ${oldSnap?.code || newSnap?.code || id}`,
        entity_type: "customer",
        entity_id: id,
        entity_code: oldSnap?.code || newSnap?.code || undefined,
        old_data: oldSnap,
        new_data: newSnap,
      });

      return sendResponse(res, 200, message.UPDATE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  public updatePublish = async (req: Request, res: Response, next: NextFunction) => {
    const publish: number = req.body.publish;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return sendResponse(res, 400, message.INVALID_ID);
    const create_id = req.id;
    try {
      const oldSnap = await getCustomerSnapshotForLog(id);
      const result = await this.customerServices.updatePublish(publish, id, create_id);
      if (result instanceof HttpException)
        return sendResponse(res, result.status, result.message);

      const newSnap = await getCustomerSnapshotForLog(id);
      writeCustomerActivityLog({
        ...this.activityMeta(req),
        seller_id: Number(req.seller_id) || Number(newSnap?.seller_id) || Number(oldSnap?.seller_id) || 0,
        action: "update_status",
        action_name: "Cập nhật trạng thái",
        summary: `KH ${oldSnap?.code || id}: ${oldSnap?.publish_name || "?"} → ${newSnap?.publish_name || publish}`,
        entity_type: "customer",
        entity_id: id,
        entity_code: oldSnap?.code || newSnap?.code || undefined,
        old_data: oldSnap
          ? { publish: oldSnap.publish, publish_name: oldSnap.publish_name }
          : null,
        new_data: newSnap
          ? { publish: newSnap.publish, publish_name: newSnap.publish_name }
          : { publish },
      });

      return sendResponse(res, 200, message.UPDATE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return sendResponse(res, 400, message.INVALID_ID);
    const create_id = req.id;
    try {
      const oldSnap = await getCustomerSnapshotForLog(id);
      const result = await this.customerServices.delete(id, create_id);
      if (result instanceof HttpException)
        return sendResponse(res, result.status, result.message);
      if (result?.errors)
        return sendResponse(res, result.statusCode, result.message, null, null, result.errors);

      writeCustomerActivityLog({
        ...this.activityMeta(req),
        seller_id: Number(req.seller_id) || Number(oldSnap?.seller_id) || 0,
        action: "delete",
        action_name: "Xóa",
        summary: `Xóa khách hàng ${oldSnap?.code || oldSnap?.name || id}`,
        entity_type: "customer",
        entity_id: id,
        entity_code: oldSnap?.code || undefined,
        old_data: oldSnap,
        new_data: null,
      });

      return sendResponse(res, 200, message.DELETE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  /** Chỉ chủ shop (is_shop_owner = 1) được reset khách hàng. */
  private async ensureShopOwner(req: Request, res: Response): Promise<boolean> {
    const token = req.header("Authorization")?.replace("Bearer ", "") as string;
    if (!token) {
      sendResponse(res, 401, "token is required");
      return false;
    }

    try {
      const profile = await getProfileUser(token);
      const isOwner =
        Number(profile?.is_shop_owner) === 1 ||
        profile?.is_shop_owner === true ||
        String(profile?.role_code || "").toLowerCase() === "shop_owner";

      if (!isOwner) {
        sendResponse(res, 403, "Chỉ chủ cửa hàng mới được reset dữ liệu khách hàng");
        return false;
      }

      if (!req.seller_id || Number(req.seller_id) <= 0) {
        sendResponse(res, 403, "Không xác định được nhà bán của tài khoản");
        return false;
      }

      return true;
    } catch (error: any) {
      sendResponse(res, 401, error?.message || "token verification failed");
      return false;
    }
  }

  /** Chủ shop: preview / hard-reset toàn bộ khách hàng của seller */
  public sellerResetCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!(await this.ensureShopOwner(req, res))) {
        return;
      }

      const body = (req.body || {}) as SellerResetCustomersDto;
      const token = req.header("Authorization")?.replace("Bearer ", "") as string;
      const sellerId = Number(req.seller_id);
      const result = await this.resetCustomersService.execute(sellerId, token, "seller", body);

      if (result instanceof HttpException) {
        if (result.field) return sendResponse(res, result.status, result.message, null, result.field);
        return sendResponse(res, result.status, result.message);
      }

      const isDryRun = Boolean((result as any)?.data?.dry_run);
      if (!isDryRun) {
        const data = (result as any)?.data || {};
        writeCustomerActivityLog({
          ...this.activityMeta(req),
          seller_id: sellerId || 0,
          actor_type: "seller",
          audience: "seller",
          action: "reset",
          action_name: "Reset dữ liệu",
          summary: `Reset toàn bộ khách hàng (${data.deleted_count ?? data.total_customers ?? "?"} KH)`,
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

export default CustomerController;
