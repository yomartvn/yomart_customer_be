import Logger from "@core/utils/logger";
import mysql from "mysql2/promise";
import messages from "@core/config/constants";
import { parseEnvInt } from "@core/utils";

class Database {
    private pool: mysql.Pool | null = null;

    async connectDB() {
        const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_CONNECTION_LIMIT, QUEUE_LIMIT, CONNECT_TIMEOUT } = process.env;
        try {
            this.pool = mysql.createPool({
                host: DB_HOST,
                user: DB_USER,
                password: DB_PASSWORD,
                database: DB_NAME,
                waitForConnections: true,
                connectionLimit: parseEnvInt(DB_CONNECTION_LIMIT, 100),
                queueLimit: parseEnvInt(QUEUE_LIMIT, 0),
                connectTimeout: parseEnvInt(CONNECT_TIMEOUT, 60000),
            });
            await this.pool.query("SELECT 1");
            Logger.info("Connected to DB successfully");
        } catch (error) {
            Logger.error("Failed to connect to DB", error);
            throw error;
        }
    }

    async getConnection(): Promise<mysql.PoolConnection> {
        if (!this.pool) throw new Error(messages.DATABASE_POOL_NOT_INITIALIZED);
        return this.pool.getConnection();
    }

    releaseConnection(connection: mysql.PoolConnection | null) {
        connection?.release();
    }

    async executeQuery<T = unknown>(query: string, params?: any[]) {
        if (!this.pool) throw new Error(messages.DATABASE_POOL_NOT_INITIALIZED);
        try {
            const [results] = await this.pool.execute(query, params);
            return results as T;
        } catch (error) {
            Logger.error("execute query failed", error);
            throw error;
        }
    }
}

export default new Database();
