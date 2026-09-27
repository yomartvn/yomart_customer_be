import { HttpException } from "@core/exceptions";
import database from "@core/config/database";
import { RowDataPacket } from "mysql2/promise";
import mysql from "mysql2/promise";
import { CreateDto } from "./dtos/create.dto";
import { checkExist } from "@core/utils/checkExist";
import messages from "@core/config/constants";
import { UpdateDto } from "./dtos/update.dto";
import { SearchDto } from "./dtos/search.dto";
import { customerGroupMessages } from "./constants";
import { databaseName } from "@core/utils/database_name";
import { checkNameExistsBySeller, checkCodeExistsBySeller } from "./utils/checkCustomerGroupName";
import { checkSellerExists } from "@apis/server/seller/seller";
import { getListUsersByIds } from "@apis/server/auth/users";

class CustomerGroupServices {
  private tableName = databaseName.customer_group;

  public getAll = async (searchDto: SearchDto, seller_id?: number, token?: string) => {
    const limit = Math.max(1, searchDto.limit ?? 10);
    const page = Math.max(1, searchDto.page ?? 1);

    const params: (string | number)[] = [];
    const whereClause: string[] = [];

    if (searchDto.key?.trim()) {
      const key = `%${searchDto.key.trim()}%`;
      whereClause.push(`(cg.code LIKE ? OR cg.name LIKE ?)`);
      params.push(key, key);
    }

    if (searchDto.publish != null) {
      whereClause.push(`cg.publish = ?`);
      params.push(searchDto.publish);
    }

    if (searchDto.seller_id != null) {
      whereClause.push(`cg.seller_id = ?`);
      params.push(searchDto.seller_id);
    } else if (seller_id != null) {
      whereClause.push(`cg.seller_id = ?`);
      params.push(seller_id);
    }

    const whereSql = whereClause.length > 0 ? `AND ${whereClause.join(" AND ")}` : "";
    const baseWhere = `WHERE 1=1 ${whereSql}`;

    const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} cg ${baseWhere}`;
    const dataQuery = `
      SELECT cg.id, cg.code, cg.name, cg.publish, cg.seller_id, cg.create_id, cg.created_at, cg.updated_at
      FROM ${this.tableName} cg
      ${baseWhere}
      ORDER BY cg.id DESC
      LIMIT ? OFFSET ?
    `;

    const [countResult, dataResult] = await Promise.all([
      database.executeQuery(countQuery, params),
      database.executeQuery(dataQuery, [...params, limit, (page - 1) * limit]),
    ]);

    const total = (countResult as RowDataPacket[])[0]?.total ?? 0;
    const totalPages = Math.ceil(Number(total) / limit);

    const rows = Array.isArray(dataResult) ? (dataResult as RowDataPacket[]) : [];
    const createIds = [...new Set(rows.map((r) => r.create_id).filter((id): id is number => id != null))];
    const userMap = token ? await getListUsersByIds(createIds, token) : {};
    const data = rows.map((r) => ({
      ...r,
      create_name: (r.create_id != null ? userMap[r.create_id] : null) ?? null,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        totalRow: Number(total),
        totalPage: totalPages,
      },
    };
  };

  public getById = async (id: number, token?: string) => {
    const query = `
      SELECT cg.id, cg.code, cg.name, cg.publish, cg.seller_id, cg.create_id, cg.created_at, cg.updated_at
      FROM ${this.tableName} cg
      WHERE cg.id = ?
    `;
    const result = await database.executeQuery(query, [id]);
    const [row] = (result as RowDataPacket[]) ?? [];
    if (!row) return new HttpException(404, messages.NOT_FOUND, "id");

    let create_name: string | null = null;
    if (row.create_id != null && token) {
      const userMap = await getListUsersByIds([row.create_id], token);
      create_name = userMap[row.create_id] ?? null;
    }

    return { data: { ...row, create_name } };
  };

  public create = async (model: CreateDto, create_id: number, seller_id: number, token?: string) => {
    const sellerExists = await checkSellerExists(seller_id, token);
    if (!sellerExists) {
      return {
        statusCode: 400,
        errors: [{ field: "seller_id", messages: [customerGroupMessages.SELLER_NOT_FOUND] }],
        message: messages.VALIDATION_FAILED,
      };
    }

    const codeExists = await checkCodeExistsBySeller(model.code, seller_id);
    if (codeExists) {
      return {
        statusCode: 400,
        errors: [{ field: "code", messages: [customerGroupMessages.CODE_EXISTED] }],
        message: messages.VALIDATION_FAILED,
      };
    }

    const nameExists = await checkNameExistsBySeller(model.name, seller_id);
    if (nameExists) {
      return {
        statusCode: 400,
        errors: [{ field: "name", messages: [customerGroupMessages.NAME_EXISTED] }],
        message: messages.VALIDATION_FAILED,
      };
    }

    try {
      const now = new Date();
      const create_id_val = create_id ?? 0;
      const publish = model.publish ?? 1;
      const code = model.code.trim();

      const result = await database.executeQuery(
        `INSERT INTO ${this.tableName} (code, name, publish, seller_id, create_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [code, model.name, publish, seller_id, create_id_val, now, now]
      );

      const id = (result as mysql.ResultSetHeader).insertId;

      return {
        data: {
          id: Number(id),
          code,
          name: model.name,
          publish,
          seller_id,
          create_id: create_id_val,
          created_at: now,
          updated_at: now,
        },
      };
    } catch (error) {
      return new HttpException(500, messages.CREATE_FAILED);
    }
  };

  public update = async (model: UpdateDto, id: number, create_id?: number, req_seller_id?: number) => {
    const check = await checkExist(this.tableName, "id", id);
    if (!check) {
      return { statusCode: 400, errors: [{ field: "data", messages: [messages.NOT_FOUND] }], message: messages.VALIDATION_FAILED };
    }

    const row = (check as RowDataPacket[])[0];
    const seller_id = row?.seller_id;

    if (req_seller_id != null && req_seller_id > 0 && Number(row?.seller_id) !== Number(req_seller_id)) {
      return { statusCode: 403, errors: [{ field: "id", messages: [customerGroupMessages.NOT_ALLOWED_UPDATE_OTHER_SELLER] }], message: messages.VALIDATION_FAILED };
    }

    const codeExists = await checkCodeExistsBySeller(model.code.trim(), seller_id, id);
    if (codeExists) {
      return { statusCode: 400, errors: [{ field: "code", messages: [customerGroupMessages.CODE_EXISTED] }], message: messages.VALIDATION_FAILED };
    }

    const nameExists = await checkNameExistsBySeller(model.name, seller_id, id);
    if (nameExists) {
      return { statusCode: 400, errors: [{ field: "name", messages: [customerGroupMessages.NAME_EXISTED] }], message: messages.VALIDATION_FAILED };
    }

    const now = new Date();
    const code = model.code.trim();

    try {
      const result = await database.executeQuery(
        `UPDATE ${this.tableName} SET code = ?, name = ?, publish = ?, updated_at = ? WHERE id = ?`,
        [code, model.name, model.publish, now, id]
      );

      if ((result as mysql.ResultSetHeader).affectedRows === 0)
        return new HttpException(400, messages.UPDATE_FAILED);

      return {
        data: { id: Number(id), code, name: model.name, publish: model.publish, updated_at: now },
      };
    } catch (error) {
      return new HttpException(500, messages.UPDATE_FAILED);
    }
  };

  public updatePublish = async (publish: number, id: number, create_id?: number, seller_id?: number) => {
    const check = await checkExist(this.tableName, "id", id);
    if (!check) return new HttpException(404, messages.NOT_FOUND, "id");

    const row = (check as RowDataPacket[])[0];
    if (seller_id != null && seller_id > 0 && Number(row?.seller_id) !== Number(seller_id)) {
      return { statusCode: 403, errors: [{ field: "id", messages: [customerGroupMessages.NOT_ALLOWED_UPDATE_OTHER_SELLER] }], message: messages.VALIDATION_FAILED };
    }

    const now = new Date();

    const result = await database.executeQuery(
      `UPDATE ${this.tableName} SET publish = ?, updated_at = ? WHERE id = ?`,
      [publish, now, id]
    );

    if ((result as mysql.ResultSetHeader).affectedRows === 0)
      return new HttpException(400, messages.UPDATE_FAILED);

    return { data: { id: Number(id), publish, updated_at: now } };
  };

  public delete = async (id: number, create_id?: number, seller_id?: number) => {
    const dataCheck = await checkExist(this.tableName, "id", id);
    if (!dataCheck) {
      return { statusCode: 400, errors: [{ field: "id", messages: [messages.NOT_FOUND] }], message: messages.VALIDATION_FAILED };
    }

    const row = (dataCheck as RowDataPacket[])[0];
    if (seller_id != null && seller_id > 0 && Number(row?.seller_id) !== Number(seller_id)) {
      return { statusCode: 403, errors: [{ field: "id", messages: [customerGroupMessages.NOT_ALLOWED_DELETE_OTHER_SELLER] }], message: messages.VALIDATION_FAILED };
    }

    const customersInGroup = await database.executeQuery(
      `SELECT id FROM ${databaseName.customer} WHERE group_id = ? LIMIT 1`,
      [id]
    );
    const hasCustomers = Array.isArray(customersInGroup) && customersInGroup.length > 0;
    if (hasCustomers) {
      return { statusCode: 400, errors: [{ field: "id", messages: [customerGroupMessages.GROUP_HAS_CUSTOMERS] }], message: messages.VALIDATION_FAILED };
    }

    const result = await database.executeQuery(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );

    if ((result as mysql.ResultSetHeader).affectedRows === 0)
      return new HttpException(400, messages.DELETE_FAILED);

    return { data: { id: Number(id) } };
  };
}

export default CustomerGroupServices;
