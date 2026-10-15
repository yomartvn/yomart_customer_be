import { HttpException } from "@core/exceptions";
import database from "@core/config/database";
import { RowDataPacket } from "mysql2/promise";
import mysql from "mysql2/promise";
import { CreateDto } from "./dtos/create.dto";
import { checkExist } from "@core/utils/checkExist";
import messages from "@core/config/constants";
import { UpdateDto } from "./dtos/update.dto";
import { SearchDto } from "./dtos/search.dto";
import { customerMessages } from "./constants";
import { databaseName } from "@core/utils/database_name";
import { checkPhoneExistsBySeller, checkEmailExistsBySeller } from "./utils/checkCustomerUnique";
import { generateCustomerCode } from "./utils/generateCustomerCode";
import { checkSellerExists } from "@apis/server/seller/seller";
import { getListUsersByIds } from "@apis/server/auth/users";
import { checkCityExists, checkWardExists, checkWardExistsAndBelongToCity } from "@modules/customer_address/utils/checkCityWard";
import { customerAddressMessages } from "@modules/customer_address/constants";
import { CreateByRegisterDto } from "./dtos/create-by-register.dto";
import { UpdateFromProfileByIDDto } from "./dtos/update-from-profile-by-id.dto";

class CustomerServices {
  private tableName = databaseName.customer;

  /** Đếm khách hàng mới theo khoảng ngày tạo (scoped seller). */
  public getNewCustomerStats = async (
    seller_id: number,
    from_date?: string,
    to_date?: string
  ) => {
    if (!seller_id) {
      return new HttpException(400, customerMessages.SELLER_NOT_FOUND || "seller_id is required");
    }

    const params: (string | number)[] = [seller_id];
    let whereSql = `WHERE c.seller_id = ?`;

    if (from_date) {
      const from = from_date.length === 10 ? `${from_date} 00:00:00` : from_date;
      whereSql += ` AND c.created_at >= ?`;
      params.push(from);
    }
    if (to_date) {
      const to = to_date.length === 10 ? `${to_date} 23:59:59` : to_date;
      whereSql += ` AND c.created_at <= ?`;
      params.push(to);
    }

    const rows = (await database.executeQuery(
      `SELECT COUNT(*) AS new_customers FROM ${this.tableName} c ${whereSql}`,
      params
    )) as RowDataPacket[];

    return {
      data: {
        new_customers: Number(rows?.[0]?.new_customers) || 0,
      },
    };
  };

  public getAll = async (searchDto: SearchDto, seller_id?: number, token?: string) => {
    const limit = Math.max(1, searchDto.limit ?? 10);
    const page = Math.max(1, searchDto.page ?? 1);

    const params: (string | number)[] = [];
    const whereClause: string[] = [];

    if (searchDto.key?.trim()) {
      whereClause.push(`(c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ? OR c.code LIKE ?)`);
      const key = `%${searchDto.key.trim()}%`;
      params.push(key, key, key, key);
    }

    if (searchDto.publish != null) {
      whereClause.push(`c.publish = ?`);
      params.push(searchDto.publish);
    }

    if (searchDto.seller_id != null) {
      whereClause.push(`c.seller_id = ?`);
      params.push(searchDto.seller_id);
    } else if (seller_id != null) {
      whereClause.push(`c.seller_id = ?`);
      params.push(seller_id);
    }

    if (searchDto.group_id != null) {
      whereClause.push(`c.group_id = ?`);
      params.push(searchDto.group_id);
    }

    if (searchDto.gender != null) {
      whereClause.push(`c.gender = ?`);
      params.push(searchDto.gender);
    }

    if (searchDto.city_id != null) {
      whereClause.push(`ca.city_id = ?`);
      params.push(searchDto.city_id);
    }

    const whereSql = whereClause.length > 0 ? `AND ${whereClause.join(" AND ")}` : "";
    const baseWhere = `WHERE 1=1 ${whereSql}`;

    // Khi lọc theo city_id cần JOIN customer_address (địa chỉ mặc định)
    const caJoin =
      searchDto.city_id != null
        ? `INNER JOIN ${databaseName.customer_address} ca ON ca.customer_id = c.id AND ca.is_default = 1`
        : `LEFT JOIN ${databaseName.customer_address} ca ON ca.customer_id = c.id AND ca.is_default = 1`;

    const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} c ${caJoin} ${baseWhere}`;
    const dataQuery = `
      SELECT c.id, c.code, c.name, c.phone, c.email, c.birthdate, c.gender, c.publish, c.seller_id, c.group_id, 
        cg.name as group_name, c.create_id, c.created_at, c.updated_at, ca.city_id, ca.ward_id,
        city.name as city_name,
        CONCAT_WS(', ', TRIM(ca.address), w.name, city.name) AS full_address
      FROM ${this.tableName} c
      ${caJoin}
      LEFT JOIN ${databaseName.customer_group} cg ON c.group_id = cg.id
      LEFT JOIN ${databaseName.city} city ON ca.city_id = city.id
      LEFT JOIN ${databaseName.ward} w ON ca.ward_id = w.id
      ${baseWhere}
      ORDER BY c.id DESC
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
      SELECT c.id, c.code, c.name, c.phone, c.email, c.birthdate, c.gender, c.publish, c.seller_id, c.group_id, c.create_id, c.created_at, c.updated_at,
        cg.name as group_name
      FROM ${this.tableName} c
      LEFT JOIN ${databaseName.customer_group} cg ON c.group_id = cg.id
      WHERE c.id = ?
    `;
    const result = await database.executeQuery(query, [id]);
    const [row] = (result as RowDataPacket[]) ?? [];
    if (!row) return new HttpException(404, messages.NOT_FOUND, "id");

    let create_name: string | null = null;
    if (row.create_id != null && token) {
      const userMap = await getListUsersByIds([row.create_id], token);
      create_name = userMap[row.create_id] ?? null;
    }

    // Lấy danh sách tất cả địa chỉ của khách hàng
    const addressQuery = `
      SELECT ca.id, ca.name, ca.phone, ca.address_type, ca.publish, ca.is_default, ca.customer_id,
        ca.city_id, ca.ward_id, ca.address, ca.create_id, ca.created_at, ca.updated_at,
        CONCAT_WS(', ', TRIM(ca.address), w.name, c.name) AS full_address
      FROM ${databaseName.customer_address} ca
      LEFT JOIN ${databaseName.city} c ON ca.city_id = c.id
      LEFT JOIN ${databaseName.ward} w ON ca.ward_id = w.id
      WHERE ca.customer_id = ?
      ORDER BY ca.is_default DESC, ca.id DESC
    `;
    const addressResult = (await database.executeQuery(addressQuery, [id])) as RowDataPacket[];
    const addressRows = Array.isArray(addressResult) ? addressResult : [];

    // Lấy create_name cho từng địa chỉ
    const addressCreateIds = [...new Set(addressRows.map((a) => a.create_id).filter((id): id is number => id != null && id !== 0))];
    const addressUserMap = token && addressCreateIds.length > 0 ? await getListUsersByIds(addressCreateIds, token) : {};
    const addresses = addressRows.map((a: RowDataPacket) => ({
      ...a,
      create_name: a.create_id ? (addressUserMap[a.create_id] ?? null) : null,
    })) as (RowDataPacket & { create_name: string | null })[];
    const default_address = addresses.find((a) => a.is_default === 1) ?? null;

    return {
      data: {
        ...row,
        create_name,
        default_address,
        addresses,
      },
    };
  };

  public create = async (model: CreateDto, create_id: number, seller_id: number, token?: string) => {    
    const sellerExists = await checkSellerExists(seller_id, token);
    if (!sellerExists) {
      return {
        statusCode: 400,
        errors: [{ field: "seller_id", messages: [customerMessages.SELLER_NOT_FOUND] }],
        message: messages.VALIDATION_FAILED,
      };
    }

    if (model.phone?.trim()) {
      const phoneExists = await checkPhoneExistsBySeller(model.phone.trim(), seller_id);
      if (phoneExists) {
        return {
          statusCode: 400,
          errors: [{ field: "phone", messages: [customerMessages.PHONE_EXISTED] }],
          message: messages.VALIDATION_FAILED,
        };
      }
    }

    if (model.email?.trim()) {
      const emailExists = await checkEmailExistsBySeller(model.email.trim(), seller_id);
      if (emailExists) {
        return {
          statusCode: 400,
          errors: [{ field: "email", messages: [customerMessages.EMAIL_EXISTED] }],
          message: messages.VALIDATION_FAILED,
        };
      }
    }

    if (model.group_id != null) {
      const groupExists = await checkExist(databaseName.customer_group, "id", model.group_id);
      if (!groupExists) {
        return {
          statusCode: 400,
          errors: [{ field: "group_id", messages: [customerMessages.GROUP_NOT_FOUND] }],
          message: messages.VALIDATION_FAILED,
        };
      }
      // Kiểm tra nhóm khách hàng thuộc nhà bán hiện tại không?
      const groupRow = (groupExists as RowDataPacket[])[0];
      if (groupRow?.seller_id !== seller_id) {
        return {
          statusCode: 400,
          errors: [{ field: "group_id", messages: [customerMessages.GROUP_NOT_FOUND] }],
          message: messages.VALIDATION_FAILED,
        };
      }
    }

    // Kiểm tra địa chỉ (city, ward) nếu có truyền
    if (model.address) {
      const cityExists = await checkCityExists(model.address.city_id);
      if (!cityExists) {
        return {
          statusCode: 400,
          errors: [{ field: "address.city_id", messages: [customerAddressMessages.CITY_NOT_FOUND] }],
          message: messages.VALIDATION_FAILED,
        };
      }
      const wardValid = await checkWardExistsAndBelongToCity(model.address.ward_id, model.address.city_id);
      if (!wardValid) {
        const wardExists = await checkWardExists(model.address.ward_id);
        const errorMessage = wardExists ? customerAddressMessages.WARD_NOT_BELONG_TO_CITY : customerAddressMessages.WARD_NOT_FOUND;
        return {
          statusCode: 400,
          errors: [{ field: "address.ward_id", messages: [errorMessage] }],
          message: messages.VALIDATION_FAILED,
        };
      }
    }

    try {
      const now = new Date();
      const create_id_val = create_id ?? 0;
      const publish = model.publish ?? 1;
      const code = await generateCustomerCode(seller_id);
      const birthdate = model.birthdate ? new Date(model.birthdate) : null;
      const group_id = model.group_id ?? null;

      const affiliate_id = Number((model as { affiliate_id?: number }).affiliate_id) || 0;

      const result = await database.executeQuery(
        `INSERT INTO ${this.tableName} (code, name, phone, email, birthdate, gender, publish, seller_id, group_id, affiliate_id, create_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code,
          model.name,
          model.phone?.trim() || null,
          model.email?.trim() || null,
          birthdate,
          model.gender ?? null,
          publish,
          seller_id,
          group_id,
          affiliate_id,
          create_id_val,
          now,
          now,
        ]
      );

      const id = (result as mysql.ResultSetHeader).insertId;

      let addressData: Record<string, unknown> | null = null;

      // Tạo địa chỉ mặc định nếu có truyền
      if (model.address) {
        const addr = model.address;
        const addressName = addr.name?.trim() || model.name;
        const addressPhone = addr.phone?.trim() || model.phone?.trim() || null;
        const addressType = addr.address_type ?? "nha_rieng";
        const cityId = Number(addr.city_id);
        const wardId = Number(addr.ward_id);
        const addressStr = addr.address?.trim() || "";

        const addrResult = await database.executeQuery(
          `INSERT INTO ${databaseName.customer_address} (name, address_type, publish, is_default, customer_id, city_id, ward_id, address, phone, create_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [addressName, addressType, 1, 1, id, cityId, wardId, addressStr, addressPhone, create_id_val, now, now]
        );

        const addressId = (addrResult as mysql.ResultSetHeader).insertId;
        addressData = {
          id: Number(addressId),
          name: addressName,
          phone: addressPhone,
          publish: 1,
          is_default: 1,
          customer_id: Number(id),
          city_id: cityId,
          ward_id: wardId,
          address: addressStr,
          address_type: addressType,
          create_id: create_id_val,
          created_at: now,
          updated_at: now,
        };
      }

      return {
        data: {
          id: Number(id),
          code,
          name: model.name,
          phone: model.phone?.trim() || null,
          email: model.email?.trim() || null,
          birthdate: birthdate,
          gender: model.gender ?? null,
          publish,
          seller_id,
          group_id,
          affiliate_id,
          create_id: create_id_val,
          created_at: now,
          updated_at: now,
          ...(addressData && { address: addressData }),
        },
      };
    } catch (error) {
      return new HttpException(500, messages.CREATE_FAILED);
    }
  };

  public createByRegister = async (model: CreateByRegisterDto, seller_id: number, token?: string) => {
    const sellerExists = await checkSellerExists(seller_id, token);
    if (!sellerExists) {
      return {
        statusCode: 400,
        errors: [{ field: "seller_id", messages: [customerMessages.SELLER_NOT_FOUND] }],
        message: messages.VALIDATION_FAILED,
      };
    }

    const phone = model.phone?.trim();
    if (phone) {
      const phoneExists = await checkPhoneExistsBySeller(phone, seller_id);
      if (phoneExists) {
        return {
          statusCode: 400,
          errors: [{ field: "phone", messages: [customerMessages.PHONE_EXISTED] }],
          message: messages.VALIDATION_FAILED,
        };
      }
    }

    if (model.email?.trim()) {
      const emailExists = await checkEmailExistsBySeller(model.email.trim(), seller_id);
      if (emailExists) {
        return {
          statusCode: 400,
          errors: [{ field: "email", messages: [customerMessages.EMAIL_EXISTED] }],
          message: messages.VALIDATION_FAILED,
        };
      }
    }

    try {
      const now = new Date();
      const code = await generateCustomerCode(seller_id);
      const create_id = 0;

      const affiliate_id = Number((model as { affiliate_id?: number }).affiliate_id) || 0;

      const result = await database.executeQuery(
        `INSERT INTO ${this.tableName} (code, name, phone, email, publish, seller_id, affiliate_id, create_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [code, model.name, phone || null, model.email?.trim() || null, 1, seller_id, affiliate_id, create_id, now, now]
      );

      const id = (result as mysql.ResultSetHeader).insertId;

      return {
        data: {
          id: Number(id),
          code,
          name: model.name,
          phone: phone || null,
          email: model.email?.trim() || null,
          publish: 1,
          seller_id,
          affiliate_id,
          create_id,
          created_at: now,
          updated_at: now,
        },
      };
    } catch (error) {
      return new HttpException(500, messages.CREATE_FAILED);
    }
  };

  public updateFromProfileByID = async (model: UpdateFromProfileByIDDto, customerId: number) => {
    
    const check = await checkExist(this.tableName, "id", customerId);
    if (!check) {
      return { statusCode: 400, errors: [{ field: "id", messages: [messages.NOT_FOUND] }], message: messages.VALIDATION_FAILED };
    }

    const now = new Date();
    const birthdate = new Date(model.birthdate);

    try {
      const result = await database.executeQuery(
        `UPDATE ${this.tableName} SET name = ?, birthdate = ?, gender = ?, updated_at = ? WHERE id = ?`,
        [model.name, birthdate, model.gender, now, customerId]
      );

      if ((result as mysql.ResultSetHeader).affectedRows === 0) {
        return new HttpException(400, messages.UPDATE_FAILED);
      }

      return {
        data: {
          id: Number(customerId),
          name: model.name,
          birthdate,
          gender: model.gender,
          updated_at: now,
        },
      };
    } catch (error) {
      return new HttpException(500, messages.UPDATE_FAILED);
    }
  };

  public update = async (model: UpdateDto, id: number, create_id?: number) => {
    const check = await checkExist(this.tableName, "id", id);
    if (!check) {
      return { statusCode: 400, errors: [{ field: "data", messages: [messages.NOT_FOUND] }], message: messages.VALIDATION_FAILED };
    }

    const row = (check as RowDataPacket[])[0];
    const seller_id = row?.seller_id;

    if (model.phone?.trim()) {
      const phoneExists = await checkPhoneExistsBySeller(model.phone.trim(), seller_id, id);
      if (phoneExists) {
        return { statusCode: 400, errors: [{ field: "phone", messages: [customerMessages.PHONE_EXISTED] }], message: messages.VALIDATION_FAILED };
      }
    }

    if (model.email?.trim()) {
      const emailExists = await checkEmailExistsBySeller(model.email.trim(), seller_id, id);
      if (emailExists) {
        return { statusCode: 400, errors: [{ field: "email", messages: [customerMessages.EMAIL_EXISTED] }], message: messages.VALIDATION_FAILED };
      }
    }

    if (model.group_id != null) {
      const groupExists = await checkExist(databaseName.customer_group, "id", model.group_id);
      if (!groupExists) {
        return { statusCode: 400, errors: [{ field: "group_id", messages: [customerMessages.GROUP_NOT_FOUND] }], message: messages.VALIDATION_FAILED };
      }
      const groupRow = (groupExists as RowDataPacket[])[0];
      if (groupRow?.seller_id !== seller_id) {
        return { statusCode: 400, errors: [{ field: "group_id", messages: [customerMessages.GROUP_NOT_FOUND] }], message: messages.VALIDATION_FAILED };
      }
    }

    const now = new Date();
    const birthdate = model.birthdate ? new Date(model.birthdate) : null;

    const group_id = model.group_id !== undefined ? model.group_id : (row as any).group_id;

    try {
      const result = await database.executeQuery(
        `UPDATE ${this.tableName} SET name = ?, phone = ?, email = ?, birthdate = ?, gender = ?, publish = ?, group_id = ?, updated_at = ? WHERE id = ?`,
        [model.name, model.phone?.trim() || null, model.email?.trim() || null, birthdate, model.gender ?? null, model.publish, group_id ?? null, now, id]
      );

      if ((result as mysql.ResultSetHeader).affectedRows === 0)
        return new HttpException(400, messages.UPDATE_FAILED);

      return {
        data: {
          id: Number(id),
          name: model.name,
          phone: model.phone?.trim() || null,
          email: model.email?.trim() || null,
          birthdate,
          gender: model.gender ?? null,
          publish: model.publish,
          group_id: group_id ?? null,
          updated_at: now,
        },
      };
    } catch (error) {
      return new HttpException(500, messages.UPDATE_FAILED);
    }
  };

  public updatePublish = async (publish: number, id: number, create_id?: number) => {
    const check = await checkExist(this.tableName, "id", id);
    if (!check) return new HttpException(404, messages.NOT_FOUND, "id");

    const now = new Date();

    const result = await database.executeQuery(
      `UPDATE ${this.tableName} SET publish = ?, updated_at = ? WHERE id = ?`,
      [publish, now, id]
    );

    if ((result as mysql.ResultSetHeader).affectedRows === 0)
      return new HttpException(400, messages.UPDATE_FAILED);

    return { data: { id: Number(id), publish, updated_at: now } };
  };

  public delete = async (id: number, create_id?: number) => {
    const dataCheck = await checkExist(this.tableName, "id", id);
    if (!dataCheck) {
      return { statusCode: 400, errors: [{ field: "id", messages: [messages.NOT_FOUND] }], message: messages.VALIDATION_FAILED };
    }

    // Xoá tất cả địa chỉ của khách hàng trước
    await database.executeQuery(
      `DELETE FROM ${databaseName.customer_address} WHERE customer_id = ?`,
      [id]
    );

    const result = await database.executeQuery(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );

    if ((result as mysql.ResultSetHeader).affectedRows === 0)
      return new HttpException(400, messages.DELETE_FAILED);

    return { data: { id: Number(id) } };
  };
}

export default CustomerServices;
