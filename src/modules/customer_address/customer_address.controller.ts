import CustomerAddressServices from "./customer_address.service";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@core/utils";
import { HttpException } from "@core/exceptions";
import { CreateDto } from "./dtos/create.dto";
import { UpdateDto } from "./dtos/update.dto";
import message from "@core/config/constants";
import { SearchDto } from "./dtos/search.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { writeCustomerActivityLog } from "@apis/server/activity-log/activity-log";
import { getCustomerAddressSnapshotForLog } from "@modules/customer/utils/activity-log-snapshot";

class CustomerAddressController {
  public customerAddressServices = new CustomerAddressServices();

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

    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      const result = await this.customerAddressServices.getAll(searchDto, token);
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
      const result = await this.customerAddressServices.getById(id, token);
      if (result instanceof HttpException)
        return sendResponse(res, result.status, result.message);
      return sendResponse(res, 200, message.FIND_BY_ID_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    const model: CreateDto = req.body as CreateDto;
    const create_id = req.id !== undefined ? req.id : 0;
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      const result = await this.customerAddressServices.create(model, create_id, token);
      if (result instanceof Error && (result as any).field)
        return sendResponse(res, (result as any).status, (result as any).message, null, (result as any).field);
      if (result instanceof Error)
        return sendResponse(res, (result as any).status, (result as any).message);
      if (result?.errors) {
        return sendResponse(res, result.statusCode, result.message, null, null, result.errors);
      }

      const addressId = Number(result?.data?.id) || 0;
      const snapshot = addressId > 0 ? await getCustomerAddressSnapshotForLog(addressId) : null;
      writeCustomerActivityLog({
        ...this.activityMeta(req),
        seller_id: Number(req.seller_id) || Number(snapshot?.seller_id) || 0,
        action: "create",
        action_name: "Tạo mới",
        summary: `Tạo địa chỉ ${snapshot?.name || result?.data?.name || addressId} (KH ${snapshot?.customer_code || ""})`.trim(),
        entity_type: "customer_address",
        entity_id: addressId || result?.data?.id,
        entity_code: snapshot?.customer_code || undefined,
        old_data: null,
        new_data: snapshot || result?.data || null,
      });

      return sendResponse(res, 200, message.CREATE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    const model: UpdateDto = req.body as UpdateDto;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return sendResponse(res, 400, message.INVALID_ID);

    const token = req.header("Authorization")?.replace("Bearer ", "");
    const create_id = req.id;
    try {
      const oldSnap = await getCustomerAddressSnapshotForLog(id);
      const result = await this.customerAddressServices.update(model, id, create_id, token);
      if (result instanceof Error && (result as any).field)
        return sendResponse(res, (result as any).status, (result as any).message, null, (result as any).field);
      if (result instanceof Error)
        return sendResponse(res, (result as any).status, (result as any).message);
      if (result?.errors) {
        return sendResponse(res, result.statusCode, result.message, null, null, result.errors);
      }

      const newSnap = await getCustomerAddressSnapshotForLog(id);
      writeCustomerActivityLog({
        ...this.activityMeta(req),
        seller_id: Number(req.seller_id) || Number(newSnap?.seller_id) || Number(oldSnap?.seller_id) || 0,
        action: "update",
        action_name: "Cập nhật",
        summary: `Cập nhật địa chỉ ${oldSnap?.name || newSnap?.name || id} (KH ${oldSnap?.customer_code || newSnap?.customer_code || ""})`.trim(),
        entity_type: "customer_address",
        entity_id: id,
        entity_code: oldSnap?.customer_code || newSnap?.customer_code || undefined,
        old_data: oldSnap,
        new_data: newSnap,
      });

      return sendResponse(res, 200, message.UPDATE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return sendResponse(res, 400, message.INVALID_ID);
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const create_id = req.id;

    try {
      const oldSnap = await getCustomerAddressSnapshotForLog(id);
      const result = await this.customerAddressServices.delete(id, create_id, token);
      if (result instanceof HttpException)
        return sendResponse(res, result.status, result.message);
      if (result?.errors)
        return sendResponse(res, result.statusCode, result.message, null, null, result.errors);

      writeCustomerActivityLog({
        ...this.activityMeta(req),
        seller_id: Number(req.seller_id) || Number(oldSnap?.seller_id) || 0,
        action: "delete",
        action_name: "Xóa",
        summary: `Xóa địa chỉ ${oldSnap?.name || id} (KH ${oldSnap?.customer_code || ""})`.trim(),
        entity_type: "customer_address",
        entity_id: id,
        entity_code: oldSnap?.customer_code || undefined,
        old_data: oldSnap,
        new_data: null,
      });

      return sendResponse(res, 200, message.DELETE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  public updatePublish = async (req: Request, res: Response, next: NextFunction) => {
    const publish: number = req.body.publish;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return sendResponse(res, 400, message.INVALID_ID);
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const create_id = req.id;
    try {
      const oldSnap = await getCustomerAddressSnapshotForLog(id);
      const result = await this.customerAddressServices.updatePublish(publish, id, create_id, token);
      if (result instanceof HttpException)
        return sendResponse(res, result.status, result.message);

      const newSnap = await getCustomerAddressSnapshotForLog(id);
      writeCustomerActivityLog({
        ...this.activityMeta(req),
        seller_id: Number(req.seller_id) || Number(newSnap?.seller_id) || Number(oldSnap?.seller_id) || 0,
        action: "update_status",
        action_name: "Cập nhật trạng thái",
        summary: `Địa chỉ ${oldSnap?.name || id}: ${oldSnap?.publish_name || "?"} → ${newSnap?.publish_name || publish}`,
        entity_type: "customer_address",
        entity_id: id,
        entity_code: oldSnap?.customer_code || newSnap?.customer_code || undefined,
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

  public updateDefault = async (req: Request, res: Response, next: NextFunction) => {
    const is_default: number = req.body.is_default;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return sendResponse(res, 400, message.INVALID_ID);
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const create_id = req.id;
    try {
      const oldSnap = await getCustomerAddressSnapshotForLog(id);
      const result = await this.customerAddressServices.updateDefault(is_default, id, create_id, token);
      if (result instanceof HttpException)
        return sendResponse(res, result.status, result.message);

      const newSnap = await getCustomerAddressSnapshotForLog(id);
      writeCustomerActivityLog({
        ...this.activityMeta(req),
        seller_id: Number(req.seller_id) || Number(newSnap?.seller_id) || Number(oldSnap?.seller_id) || 0,
        action: "set_default",
        action_name: "Đặt mặc định",
        summary: `Đặt địa chỉ mặc định ${newSnap?.name || id} (KH ${newSnap?.customer_code || oldSnap?.customer_code || ""})`.trim(),
        entity_type: "customer_address",
        entity_id: id,
        entity_code: oldSnap?.customer_code || newSnap?.customer_code || undefined,
        old_data: oldSnap
          ? { is_default: oldSnap.is_default, name: oldSnap.name }
          : null,
        new_data: newSnap
          ? { is_default: newSnap.is_default, name: newSnap.name }
          : { is_default },
      });

      return sendResponse(res, 200, message.UPDATE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };
}

export default CustomerAddressController;
