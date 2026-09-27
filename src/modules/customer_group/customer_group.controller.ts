import CustomerGroupServices from "./customer_group.service";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@core/utils";
import { HttpException } from "@core/exceptions";
import { CreateDto } from "./dtos/create.dto";
import { UpdateDto } from "./dtos/update.dto";
import message from "@core/config/constants";
import { SearchDto } from "./dtos/search.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { customerGroupMessages } from "./constants";
import { writeCustomerActivityLog } from "@apis/server/activity-log/activity-log";
import { getCustomerGroupSnapshotForLog } from "@modules/customer/utils/activity-log-snapshot";

class CustomerGroupController {
  public customerGroupServices = new CustomerGroupServices();

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
      const result = await this.customerGroupServices.getAll(searchDto, seller_id, token);
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
      const result = await this.customerGroupServices.getById(id, token);
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
      return sendResponse(res, 403, customerGroupMessages.REQUIRED_SELLER_CREATE);
    }
    const model: CreateDto = req.body as CreateDto;
    const create_id = req.id !== undefined ? req.id : 0;
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      const result = await this.customerGroupServices.create(model, create_id, seller_id, token);
      if (result instanceof Error && (result as any).field)
        return sendResponse(res, (result as any).status, (result as any).message, null, (result as any).field);
      if (result instanceof Error)
        return sendResponse(res, (result as any).status, (result as any).message);
      if (result?.errors) {
        return sendResponse(res, result.statusCode, result.message, null, null, result.errors);
      }

      const groupId = Number(result?.data?.id) || 0;
      const snapshot =
        (groupId > 0 ? await getCustomerGroupSnapshotForLog(groupId) : null) || result?.data || null;
      writeCustomerActivityLog({
        ...this.activityMeta(req),
        seller_id: Number(seller_id) || Number(snapshot?.seller_id) || 0,
        action: "create",
        action_name: "Tạo mới",
        summary: `Tạo nhóm KH ${snapshot?.code || snapshot?.name || groupId}`.trim(),
        entity_type: "customer_group",
        entity_id: groupId || result?.data?.id,
        entity_code: snapshot?.code || result?.data?.code || undefined,
        old_data: null,
        new_data: snapshot,
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
    const seller_id = req.seller_id;
    if (seller_id == null || seller_id === undefined) {
      return sendResponse(res, 403, customerGroupMessages.REQUIRED_SELLER_UPDATE);
    }
    const create_id = req.id;
    try {
      const oldSnap = await getCustomerGroupSnapshotForLog(id);
      const result = await this.customerGroupServices.update(model, id, create_id, seller_id);
      if (result instanceof Error && (result as any).field)
        return sendResponse(res, (result as any).status, (result as any).message, null, (result as any).field);
      if (result instanceof Error)
        return sendResponse(res, (result as any).status, (result as any).message);
      if (result?.errors) {
        return sendResponse(res, result.statusCode, result.message, null, null, result.errors);
      }

      const newSnap = await getCustomerGroupSnapshotForLog(id);
      writeCustomerActivityLog({
        ...this.activityMeta(req),
        seller_id: Number(seller_id) || Number(newSnap?.seller_id) || Number(oldSnap?.seller_id) || 0,
        action: "update",
        action_name: "Cập nhật",
        summary: `Cập nhật nhóm KH ${oldSnap?.code || newSnap?.code || id}`,
        entity_type: "customer_group",
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
    const seller_id = req.seller_id;
    if (seller_id == null || seller_id === undefined) {
      return sendResponse(res, 403, customerGroupMessages.REQUIRED_SELLER_UPDATE_PUBLISH);
    }
    const create_id = req.id;
    try {
      const oldSnap = await getCustomerGroupSnapshotForLog(id);
      const result = await this.customerGroupServices.updatePublish(publish, id, create_id, seller_id);
      if (result instanceof HttpException)
        return sendResponse(res, result.status, result.message);
      if (result?.errors)
        return sendResponse(res, result.statusCode, result.message, null, null, result.errors);

      const newSnap = await getCustomerGroupSnapshotForLog(id);
      writeCustomerActivityLog({
        ...this.activityMeta(req),
        seller_id: Number(seller_id) || Number(newSnap?.seller_id) || Number(oldSnap?.seller_id) || 0,
        action: "update_status",
        action_name: "Cập nhật trạng thái",
        summary: `Nhóm ${oldSnap?.code || id}: ${oldSnap?.publish_name || "?"} → ${newSnap?.publish_name || publish}`,
        entity_type: "customer_group",
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
    const seller_id = req.seller_id;
    if (seller_id == null || seller_id === undefined) {
      return sendResponse(res, 403, customerGroupMessages.REQUIRED_SELLER_DELETE);
    }
    const create_id = req.id;
    try {
      const oldSnap = await getCustomerGroupSnapshotForLog(id);
      const result = await this.customerGroupServices.delete(id, create_id, seller_id);
      if (result instanceof HttpException)
        return sendResponse(res, result.status, result.message);
      if (result?.errors)
        return sendResponse(res, result.statusCode, result.message, null, null, result.errors);

      writeCustomerActivityLog({
        ...this.activityMeta(req),
        seller_id: Number(seller_id) || Number(oldSnap?.seller_id) || 0,
        action: "delete",
        action_name: "Xóa",
        summary: `Xóa nhóm KH ${oldSnap?.code || oldSnap?.name || id}`,
        entity_type: "customer_group",
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
}

export default CustomerGroupController;
