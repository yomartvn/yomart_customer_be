import { HttpException } from "@core/exceptions";
import database from "@core/config/database";
import { RowDataPacket } from "mysql2/promise";
import mysql from "mysql2/promise";
import { CreateDto } from "./dtos/create.dto";
import { checkExist } from "@core/utils/checkExist";
import messages from "@core/config/constants";
import { UpdateDto } from "./dtos/update.dto";
import { SearchDto } from "./dtos/search.dto";
import { customerAddressMessages } from "./constants";
import { databaseName } from "@core/utils/database_name";
import { checkCityExists, checkWardExists, checkWardExistsAndBelongToCity } from "./utils/checkCityWard";
import { getListUsersByIds } from "@apis/server/auth/users";

class CustomerAddressServices {
  private tableName = databaseName.customer_address;

  public getAll = async (searchDto: SearchDto, token?: string) => {
    const limit = Math.max(1, searchDto.limit ?? 10);
    const page = Math.max(1, searchDto.page ?? 1);

    const params: (string | number)[] = [];
    const whereClause: string[] = [];

    if (searchDto.key?.trim()) {
      const keySearch = `%${searchDto.key.trim()}%`;
      whereClause.push(`(ca.name LIKE ? OR ca.phone LIKE ?)`);
      params.push(keySearch, keySearch);
    }

    if (searchDto.publish != null) {
      whereClause.push(`ca.publish = ?`);
      params.push(searchDto.publish);
    }

    if (searchDto.customer_id != null) {
      whereClause.push(`ca.customer_id = ?`);
      params.push(searchDto.customer_id);
    }

    if (searchDto.city_id != null) {
      whereClause.push(`ca.city_id = ?`);
      params.push(searchDto.city_id);
    }

    const whereSql = whereClause.length > 0 ? `AND ${whereClause.join(" AND ")}` : "";
    const baseWhere = `WHERE 1=1 ${whereSql}`;

    const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} ca ${baseWhere}`;
    const dataQuery = `
      SELECT ca.id, ca.name, ca.phone, ca.publish, ca.is_default, ca.customer_id, ca.city_id, ca.ward_id,
        ca.address_type, ca.address, ca.create_id, ca.created_at, ca.updated_at,
        CONCAT_WS(', ', TRIM(ca.address), w.name, c.name) AS full_address
      FROM ${this.tableName} ca
      LEFT JOIN ${databaseName.city} c ON ca.city_id = c.id
      LEFT JOIN ${databaseName.ward} w ON ca.ward_id = w.id
      ${baseWhere}
      ORDER BY ca.id DESC
      LIMIT ? OFFSET ?
    `;

    const [countResult, dataResult] = await Promise.all([
      database.executeQuery(countQuery, params),
      database.executeQuery(dataQuery, [...params, limit, (page - 1) * limit]),
    ]);

    const total = (countResult as RowDataPacket[])[0]?.total ?? 0;
    const totalPages = Math.ceil(Number(total) / limit);

    let data = Array.isArray(dataResult) ? dataResult : [];

    // Lấy tên người tạo từ Auth API (users ở server khác)
    if (token && data.length > 0) {
      const createIds = [...new Set(data.map((r: RowDataPacket) => r.create_id).filter((id): id is number => id != null && id !== 0))];
      const creatorMap = await getListUsersByIds(createIds, token);
      console.log("creatorMap", creatorMap);
      
      data = data.map((row: RowDataPacket) => ({
        ...row,
        creator_name: row.create_id ? creatorMap[row.create_id] ?? null : null,
      }));
    } else if (data.length > 0) {
      data = data.map((row: RowDataPacket) => ({
        ...row,
        creator_name: null,
      }));
    }

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
      SELECT ca.id, ca.name, ca.phone, ca.address_type, ca.publish, ca.is_default, ca.customer_id,
        ca.create_id, ca.created_at, ca.updated_at, ca.address, ca.city_id, ca.ward_id,
        CONCAT_WS(', ', TRIM(ca.address), w.name, c.name) AS full_address
      FROM ${this.tableName} ca
      LEFT JOIN ${databaseName.city} c ON ca.city_id = c.id
      LEFT JOIN ${databaseName.ward} w ON ca.ward_id = w.id
      WHERE ca.id = ?
    `;
    const result = await database.executeQuery(query, [id]);
    const [row] = (result as RowDataPacket[]) ?? [];
    if (!row) return new HttpException(404, messages.NOT_FOUND, "id");

    let data = { ...row };
    if (token && row.create_id) {
      const creatorMap = await getListUsersByIds([row.create_id], token);
      data = { ...row, creator_name: creatorMap[row.create_id] ?? null };
    } else {
      data = { ...row, creator_name: null };
    }
    return { data };
  };

  public create = async (model: CreateDto, create_id: number, token?: string) => {
    // Kiểm tra khách hàng có tồn tại không
    const customerExists = await checkExist(databaseName.customer, "id", model.customer_id);
    if (!customerExists) {
      return {
        statusCode: 400,
        errors: [{ field: "customer_id", messages: [customerAddressMessages.CUSTOMER_NOT_FOUND] }],
        message: messages.VALIDATION_FAILED,
      };
    }

    // Kiểm tra tỉnh/thành có tồn tại không
    const cityExists = await checkCityExists(model.city_id);
    if (!cityExists) {
      return {
        statusCode: 400,
        errors: [{ field: "city_id", messages: [customerAddressMessages.CITY_NOT_FOUND] }],
        message: messages.VALIDATION_FAILED,
      };
    }

    // Kiểm tra phường/xã có tồn tại và thuộc tỉnh/thành không
    const wardValid = await checkWardExistsAndBelongToCity(model.ward_id, model.city_id);
    if (!wardValid) {
      const wardExists = await checkWardExists(model.ward_id);
      const errorMessage = wardExists ? customerAddressMessages.WARD_NOT_BELONG_TO_CITY : customerAddressMessages.WARD_NOT_FOUND;
      return {
        statusCode: 400,
        errors: [{ field: "ward_id", messages: [errorMessage] }],
        message: messages.VALIDATION_FAILED,
      };
    }

    const is_default = model.is_default ?? 0;

    try {
      const now = new Date();

      // Nếu đặt is_default=1: cập nhật tất cả địa chỉ khác của khách hàng về is_default=0
      if (is_default === 1) {
        await database.executeQuery(
          `UPDATE ${this.tableName} SET is_default = 0, updated_at = ? WHERE customer_id = ?`,
          [now, model.customer_id]
        );
      }

      const create_id_val = create_id ?? 0;
      const publish = model.publish ?? 1;
      const city_id = model.city_id ?? null;
      const ward_id = model.ward_id ?? null;
      const address = model.address ?? null;
      const address_type = model.address_type ?? null;
      const phone = model.phone?.trim() ?? null;

      const result = await database.executeQuery(
        `INSERT INTO ${this.tableName} (name, address_type, publish, is_default, customer_id, city_id, ward_id, address, phone, create_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [model.name, address_type, publish, is_default, model.customer_id, city_id, ward_id, address, phone, create_id_val, now, now]
      );

      const id = (result as mysql.ResultSetHeader).insertId;

      return {
        data: {
          id: Number(id),
          name: model.name,
          phone,
          publish,
          is_default,
          customer_id: model.customer_id,
          city_id,
          ward_id,
          address,
          address_type,
          create_id: create_id_val,
          created_at: now,
          updated_at: now,
        },
      };
    } catch (error) {
      return new HttpException(500, messages.CREATE_FAILED);
    }
  };

  public update = async (model: UpdateDto, id: number, create_id?: number, token?: string) => {
    // kiểm tra xem dữ liệu có tồn tại không
    const check = await checkExist(this.tableName, "id", id);
    if (check == false) {
      return { statusCode: 400, errors: [{ field: "data", messages: [messages.NOT_FOUND] }], message: messages.VALIDATION_FAILED };
    }
    //
    const row = (check as RowDataPacket[])[0];
    const isDefaultAddress = row?.is_default == 1;
    const customer_id = row.customer_id;

    // Dùng is_default từ body nếu có truyền, không thì giữ giá trị cũ
    const is_default = model.is_default !== undefined && model.is_default !== null ? model.is_default : (row.is_default ?? 0);

    const now = new Date();
    // Địa chỉ mặc định: không cho cập nhật publish
    const publish = isDefaultAddress ? row.publish : model.publish;
    const city_id = model.city_id;
    const ward_id = model.ward_id;
    const address = model.address;
    const address_type = model.address_type;
    const phone = model.phone?.trim() ?? null;

    // Kiểm tra city_id, ward_id có tồn tại
    const cityExists = await checkCityExists(city_id);
    if (!cityExists) {
      return {
        statusCode: 400,
        errors: [{ field: "city_id", messages: [customerAddressMessages.CITY_NOT_FOUND] }],
        message: messages.VALIDATION_FAILED,
      };
    }

    const wardValid = await checkWardExistsAndBelongToCity(ward_id, city_id);
    if (!wardValid) {
      const wardExists = await checkWardExists(ward_id);
      const errorMessage = wardExists ? customerAddressMessages.WARD_NOT_BELONG_TO_CITY : customerAddressMessages.WARD_NOT_FOUND;
      return {
        statusCode: 400,
        errors: [{ field: "ward_id", messages: [errorMessage] }],
        message: messages.VALIDATION_FAILED,
      };
    }

    try {
      // Nếu đặt is_default=1: cập nhật tất cả địa chỉ khác của khách hàng về is_default=0
      if (is_default === 1) {
        await database.executeQuery(
          `UPDATE ${this.tableName} SET is_default = 0, updated_at = ? WHERE customer_id = ? AND id != ?`,
          [now, customer_id, id]
        );
      }

      const result = await database.executeQuery(
        `UPDATE ${this.tableName} SET name = ?, address_type = ?, publish = ?, is_default = ?, city_id = ?, ward_id = ?, address = ?, phone = ?, updated_at = ? WHERE id = ?`,
        [model.name, address_type, publish, is_default, city_id, ward_id, address, phone, now, id]
      );

      if ((result as mysql.ResultSetHeader).affectedRows === 0)
        return new HttpException(400, messages.UPDATE_FAILED);

      return {
        data: { id: Number(id), name: model.name, address_type, publish, is_default, city_id, ward_id, address, phone, updated_at: now },
      };
    } catch (error) {
      return new HttpException(500, messages.UPDATE_FAILED);
    }
  };

  public delete = async (id: number, create_id?: number, token?: string) => {
    const dataCheck = await checkExist(this.tableName, "id", id);
    if (!dataCheck) {
      return { statusCode: 400, errors: [{ field: "id", messages: [messages.NOT_FOUND] }], message: messages.VALIDATION_FAILED };
    }

    const row = (dataCheck as RowDataPacket[])[0];
    if (row?.is_default == 1) {
      return { statusCode: 400, errors: [{ field: "id", messages: [customerAddressMessages.CUSTOMER_ADDRESS_DEFAULT_DELETE] }], message: messages.VALIDATION_FAILED };
    }

    const result = await database.executeQuery(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );

    if ((result as mysql.ResultSetHeader).affectedRows === 0)
      return new HttpException(400, messages.DELETE_FAILED);

    return { data: { id: Number(id) } };
  };

  public updatePublish = async (publish: number, id: number, create_id?: number, token?: string) => {
    const check = await checkExist(this.tableName, "id", id);
    if (!check) return new HttpException(404, messages.NOT_FOUND, "id");

    const row = (check as RowDataPacket[])[0];
    if (row?.is_default == 1) {
      return {
        statusCode: 400,
        errors: [{ field: "id", messages: [customerAddressMessages.CUSTOMER_ADDRESS_DEFAULT] }],
        message: messages.VALIDATION_FAILED,
      };
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

  public updateDefault = async (is_default: number, id: number, create_id?: number, token?: string) => {
    const check = await checkExist(this.tableName, "id", id);
    if (!check) return new HttpException(404, messages.NOT_FOUND, "id");

    const row = (check as RowDataPacket[])[0];
    const customer_id = row.customer_id;
    const now = new Date();

    // Nếu đặt is_default=1: cập nhật tất cả địa chỉ khác của khách hàng về is_default=0
    if (is_default === 1) {
      await database.executeQuery(
        `UPDATE ${this.tableName} SET is_default = 0, updated_at = ? WHERE customer_id = ? AND id != ?`,
        [now, customer_id, id]
      );
    }

    const result = await database.executeQuery(
      `UPDATE ${this.tableName} SET is_default = ?, updated_at = ? WHERE id = ?`,
      [is_default, now, id]
    );

    if ((result as mysql.ResultSetHeader).affectedRows === 0)
      return new HttpException(400, messages.UPDATE_FAILED);

    return { data: { id: Number(id), is_default, updated_at: now } };
  };
}

export default CustomerAddressServices;
