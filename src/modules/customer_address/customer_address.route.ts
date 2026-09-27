import CustomerAddressController from "./customer_address.controller";
import { IRoute } from "@core/interfaces";
import { errorMiddleware } from "@core/middleware";
import { Router } from "express";
import { CreateDto } from "./dtos/create.dto";
import { AuthMiddleware } from "@core/middleware";
import { UpdateDto } from "./dtos/update.dto";
import { SearchDto } from "./dtos/search.dto";
import { UpdatePublishDto } from "./dtos/update-publish.dto";
import { UpdateDefaultDto } from "./dtos/update-default.dto";

class CustomerAddressRoute implements IRoute {
  public path = "/customer-address";
  public router = Router();

  public customerAddressController = new CustomerAddressController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      this.path + "/get-by-id/:id",
      AuthMiddleware.authorization(true),
      this.customerAddressController.getById
    );
    this.router.get(
      this.path + "/",
      AuthMiddleware.authorization(true),
      errorMiddleware(SearchDto, "query", true),
      this.customerAddressController.getAll
    );
    this.router.post(
      this.path + "/",
      AuthMiddleware.authorization(true),
      errorMiddleware(CreateDto, "body", false),
      this.customerAddressController.create
    );
    this.router.put(
      this.path + "/update-publish/:id",
      AuthMiddleware.authorization(true),
      errorMiddleware(UpdatePublishDto, "body", false),
      this.customerAddressController.updatePublish
    );
    this.router.put(
      this.path + "/update-default/:id",
      AuthMiddleware.authorization(true),
      errorMiddleware(UpdateDefaultDto, "body", false),
      this.customerAddressController.updateDefault
    );
    this.router.put(
      this.path + "/:id",
      AuthMiddleware.authorization(true),
      errorMiddleware(UpdateDto, "body", false),
      this.customerAddressController.update
    );
    this.router.delete(
      this.path + "/:id",
      AuthMiddleware.authorization(true),
      this.customerAddressController.delete
    );
  }
}

export default CustomerAddressRoute;
