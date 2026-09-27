import database from "@core/config/database";
import { RowDataPacket } from "mysql2";

export const checkExist = async (tableName: string, column: string, value: string | number, id?: string | number) => {
    let query = `SELECT * FROM ${tableName} WHERE ${column} = ?`;
    const params: any[] = [value];
    if (id) {
        query += ` AND id != ?`
        params.push(id);
    }
    const checkExist = await database.executeQuery(query, params);
    if (Array.isArray(checkExist) && checkExist.length > 0) {
        delete (checkExist as RowDataPacket[])[0].password;
        delete (checkExist as RowDataPacket[])[0].p_txt;
        return checkExist as RowDataPacket[0];
    }
    return false
}