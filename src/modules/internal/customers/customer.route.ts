import { Router } from "express";
import { IRoute } from "@core/interfaces";
import { errorMiddleware, InternalAuthMiddleware } from "@core/middleware";
import InternalCustomerController from "./customer.controller";
import { ByIdsDto } from "./dtos/by-ids.dto";

class InternalCustomerRoute implements IRoute {
  public path = "/internal/customers";
  public router = Router();

  private customerController = new InternalCustomerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      this.path + "/by-ids",
      InternalAuthMiddleware.verify(),
      errorMiddleware(ByIdsDto, "body", false),
      this.customerController.getByIds
    );
  }
}

export default InternalCustomerRoute;
