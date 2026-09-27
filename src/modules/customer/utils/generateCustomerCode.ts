import database from "@core/config/database";
import { RowDataPacket } from "mysql2/promise";
import { databaseName } from "@core/utils/database_name";

/**
 * Tạo mã khách hàng dạng KH000001, KH000002, ... (KH + 6 ký tự số tăng dần)
 * Mã được tạo theo seller_id
 */
export const generateCustomerCode = async (sellerId: number): Promise<string> => {
  const query = `
    SELECT code FROM ${databaseName.customer}
    WHERE seller_id = ?
    ORDER BY id DESC
    LIMIT 1
  `;
  const result = await database.executeQuery(query, [sellerId]);
  const rows = result as RowDataPacket[];
  const lastCode = rows?.[0]?.code;
  const sellerPrefix = `KH${sellerId}`;

  let nextNum = 1;
  if (lastCode && typeof lastCode === "string") {
    const escapedPrefix = sellerPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = lastCode.match(new RegExp(`^${escapedPrefix}(\\d{6})$`, "i"));
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `${sellerPrefix}${String(nextNum).padStart(6, "0")}`;
};
