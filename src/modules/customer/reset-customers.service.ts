import { ResultSetHeader, RowDataPacket } from "mysql2";
import database from "@core/config/database";
import { HttpException } from "@core/exceptions";
import { databaseName } from "@core/utils/database_name";
import { forwardSellerResetOrders } from "@apis/server/order/order";
import { SellerResetCustomersDto } from "./dtos/seller-reset-customers.dto";

const warningFromError = (prefix: string, error: unknown) => {
  const err = error as { details?: { message?: string }; message?: string };
  const detail = err?.details?.message || err?.message || String(error);
  return `${prefix}: ${detail}`;
};

export type ResetCustomersCaller = "admin" | "seller";

class ResetCustomersService {
  private async countRows(sql: string, params: Array<string | number>) {
    const rows = (await database.executeQuery(sql, params)) as RowDataPacket[];
    return Number(rows?.[0]?.total || 0);
  }

  private async loadPreview(sellerId: number) {
    const [total_customers, address_count, group_count, codeRows] = await Promise.all([
      this.countRows(`SELECT COUNT(*) AS total FROM ${databaseName.customer} WHERE seller_id = ?`, [sellerId]),
      this.countRows(
        `SELECT COUNT(*) AS total FROM ${databaseName.customer_address} ca
         INNER JOIN ${databaseName.customer} c ON c.id = ca.customer_id
         WHERE c.seller_id = ?`,
        [sellerId]
      ),
      this.countRows(`SELECT COUNT(*) AS total FROM ${databaseName.customer_group} WHERE seller_id = ?`, [sellerId]),
      database.executeQuery(
        `SELECT code FROM ${databaseName.customer} WHERE seller_id = ? AND code IS NOT NULL AND code <> '' ORDER BY id DESC LIMIT 10`,
        [sellerId]
      ) as Promise<RowDataPacket[]>,
    ]);

    const codes = (Array.isArray(codeRows) ? codeRows : [])
      .map((row) => String(row.code || "").trim())
      .filter(Boolean);

    return {
      seller_id: sellerId,
      total_customers,
      address_count,
      group_count,
      codes,
    };
  }

  public execute = async (
    sellerId: number,
    token: string,
    caller: ResetCustomersCaller,
    options?: SellerResetCustomersDto
  ) => {
    if (!sellerId || sellerId <= 0) {
      return new HttpException(400, "seller_id không hợp lệ", "seller_id");
    }

    const dryRun = Boolean(options?.dry_run);
    const confirm = String(options?.confirm || "").trim().toUpperCase();
    const resetOrders = Boolean(options?.reset_orders);
    const preview = await this.loadPreview(sellerId);

    if (dryRun) {
      const warnings: string[] = [];
      if (!resetOrders) {
        warnings.push(
          "Đơn hàng, đánh giá và điểm gắn khách hàng không bị xóa. Tick reset luôn đơn hàng nếu muốn xóa luôn đơn."
        );
      }

      let ordersPreview: Record<string, unknown> | null = null;
      if (resetOrders) {
        try {
          const orderResult = await forwardSellerResetOrders({
            sellerId,
            token,
            dryRun: true,
            asAdmin: caller === "admin",
          });
          const orderData = (orderResult as { data?: Record<string, unknown> })?.data || orderResult || {};
          ordersPreview = {
            total_orders: Number((orderData as { total_orders?: number }).total_orders || 0),
            codes: Array.isArray((orderData as { codes?: unknown[] }).codes)
              ? (orderData as { codes: unknown[] }).codes.slice(0, 10)
              : [],
          };
        } catch (error) {
          warnings.push(warningFromError("Không xem trước được reset đơn hàng", error));
        }
      }

      return {
        data: {
          dry_run: true,
          ...preview,
          reset_orders: resetOrders,
          orders_preview: ordersPreview,
          warnings,
          message: "Chế độ xem trước — chưa xóa dữ liệu",
        },
      };
    }

    if (confirm !== "RESET") {
      return new HttpException(
        400,
        'Vui lòng gửi confirm = "RESET" để xác nhận xóa cứng toàn bộ khách hàng',
        "confirm"
      );
    }

    const warnings: string[] = [];
    let deletedCustomers = 0;
    let deletedAddresses = 0;
    let deletedGroups = 0;

    const conn = await database.getConnection();
    try {
      await conn.beginTransaction();

      const [addrDel] = await conn.execute<ResultSetHeader>(
        `DELETE ca FROM ${databaseName.customer_address} ca
         INNER JOIN ${databaseName.customer} c ON c.id = ca.customer_id
         WHERE c.seller_id = ?`,
        [sellerId]
      );
      deletedAddresses = Number(addrDel.affectedRows || 0);

      const [cusDel] = await conn.execute<ResultSetHeader>(
        `DELETE FROM ${databaseName.customer} WHERE seller_id = ?`,
        [sellerId]
      );
      deletedCustomers = Number(cusDel.affectedRows || 0);

      const [groupDel] = await conn.execute<ResultSetHeader>(
        `DELETE FROM ${databaseName.customer_group} WHERE seller_id = ?`,
        [sellerId]
      );
      deletedGroups = Number(groupDel.affectedRows || 0);

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      database.releaseConnection(conn);
    }

    let ordersResult: Record<string, unknown> | null = null;
    if (resetOrders) {
      try {
        const orderResult = await forwardSellerResetOrders({
          sellerId,
          token,
          dryRun: false,
          confirm: "RESET",
          asAdmin: caller === "admin",
        });
        const orderData = (orderResult as { data?: Record<string, unknown> })?.data || orderResult || {};
        ordersResult = orderData as Record<string, unknown>;
        if (Array.isArray((orderData as { warnings?: unknown[] }).warnings)) {
          warnings.push(...(orderData as { warnings: unknown[] }).warnings.map((item) => String(item)));
        }
      } catch (error) {
        warnings.push(warningFromError("Reset đơn hàng thất bại sau khi đã xóa khách hàng", error));
      }
    }

    return {
      data: {
        dry_run: false,
        ...preview,
        deleted_count: deletedCustomers,
        deleted_customers: deletedCustomers,
        deleted_addresses: deletedAddresses,
        deleted_groups: deletedGroups,
        reset_orders: resetOrders ? ordersResult : null,
        warnings,
      },
    };
  };
}

export default ResetCustomersService;
