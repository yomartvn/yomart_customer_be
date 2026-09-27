import database from "@core/config/database";
import { RowDataPacket } from "mysql2/promise";
import { databaseName } from "@core/utils/database_name";

/**
 * Kiểm tra số điện thoại đã tồn tại trong cùng seller_id chưa
 */
export const checkPhoneExistsBySeller = async (
  phone: string,
  sellerId: number,
  excludeId?: number
): Promise<boolean> => {
  if (!phone || !phone.trim()) return false;

  let query = `SELECT id FROM ${databaseName.customer} WHERE phone = ? AND seller_id = ?`;
  const params: (string | number)[] = [phone.trim(), sellerId];
  if (excludeId != null) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }
  const result = await database.executeQuery(query, params);
  const rows = result as RowDataPacket[];
  return Array.isArray(rows) && rows.length > 0;
};

/**
 * Kiểm tra email đã tồn tại trong cùng seller_id chưa
 */
export const checkEmailExistsBySeller = async (
  email: string,
  sellerId: number,
  excludeId?: number
): Promise<boolean> => {
  if (!email || !email.trim()) return false;

  let query = `SELECT id FROM ${databaseName.customer} WHERE email = ? AND seller_id = ?`;
  const params: (string | number)[] = [email.trim(), sellerId];
  if (excludeId != null) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }
  const result = await database.executeQuery(query, params);
  const rows = result as RowDataPacket[];
  return Array.isArray(rows) && rows.length > 0;
};
