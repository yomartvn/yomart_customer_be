import database from "@core/config/database";
import { RowDataPacket } from "mysql2/promise";
import { databaseName } from "@core/utils/database_name";

/**
 * Kiểm tra tên nhóm khách hàng đã tồn tại trong cùng seller_id chưa
 */
export const checkNameExistsBySeller = async (
  name: string,
  sellerId: number,
  excludeId?: number
): Promise<boolean> => {
  let query = `SELECT id FROM ${databaseName.customer_group} WHERE name = ? AND seller_id = ?`;
  const params: (string | number)[] = [name, sellerId];
  if (excludeId != null) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }
  const result = await database.executeQuery(query, params);
  const rows = result as RowDataPacket[];
  return Array.isArray(rows) && rows.length > 0;
};

/**
 * Kiểm tra mã nhóm khách hàng đã tồn tại trong cùng seller_id chưa
 */
export const checkCodeExistsBySeller = async (
  code: string,
  sellerId: number,
  excludeId?: number
): Promise<boolean> => {
  let query = `SELECT id FROM ${databaseName.customer_group} WHERE code = ? AND seller_id = ?`;
  const params: (string | number)[] = [code.trim(), sellerId];
  if (excludeId != null) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }
  const result = await database.executeQuery(query, params);
  const rows = result as RowDataPacket[];
  return Array.isArray(rows) && rows.length > 0;
};
