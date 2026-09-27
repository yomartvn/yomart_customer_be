import { IRoute } from "@core/interfaces";
import { Router } from "express";
import AdminAuthMiddleware from "@core/middleware/admin-auth.middleware";
import { errorMiddleware } from "@core/middleware";
import { AdminCustomerController } from "./admin.controller";
import { SellerResetCustomersDto } from "@modules/customer/dtos/seller-reset-customers.dto";

class AdminRoute implements IRoute {
  public path = "/admin";
  public router = Router();
  public customerController = new AdminCustomerController();

  constructor() {
    this.router.post(
      `${this.path}/sellers/:sellerId/reset-customers`,
      AdminAuthMiddleware.verify(),
      errorMiddleware(SellerResetCustomersDto, "body", true),
      this.customerController.resetSellerCustomers
    );
  }
}

export { AdminRoute };
