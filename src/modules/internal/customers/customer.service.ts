import database from "@core/config/database";
import { databaseName } from "@core/utils/database_name";
import { RowDataPacket } from "mysql2/promise";

export interface InternalCustomerItem {
  id: number;
  name: string;
  code: string;
  phone: string | null;
  email: string | null;
}

class InternalCustomerService {
  private tableName = databaseName.customer;

  public getByIds = async (ids: number[]): Promise<InternalCustomerItem[]> => {
    const uniqueIds = [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))];
    if (uniqueIds.length === 0) return [];

    const placeholders = uniqueIds.map(() => "?").join(", ");
    const query = `
      SELECT id, name, code, phone, email
      FROM ${this.tableName}
      WHERE id IN (${placeholders})
      ORDER BY id ASC
    `;

    const result = (await database.executeQuery(query, uniqueIds)) as RowDataPacket[];
    const rows = Array.isArray(result) ? result : [];

    return rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      code: String(row.code),
      phone: row.phone != null ? String(row.phone) : null,
      email: row.email != null ? String(row.email) : null,
    }));
  };
}

export default InternalCustomerService;
