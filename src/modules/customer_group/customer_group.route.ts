import CustomerGroupController from "./customer_group.controller";
import { IRoute } from "@core/interfaces";
import { errorMiddleware } from "@core/middleware";
import { Router } from "express";
import { CreateDto } from "./dtos/create.dto";
import { AuthMiddleware } from "@core/middleware";
import { UpdateDto } from "./dtos/update.dto";
import { SearchDto } from "./dtos/search.dto";
import { UpdatePublishDto } from "./dtos/update-publish.dto";

class CustomerGroupRoute implements IRoute {
  public path = "/customer-group";
  public router = Router();

  public customerGroupController = new CustomerGroupController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      this.path + "/get-by-id/:id",
      AuthMiddleware.authorization(true),
      this.customerGroupController.getById
    );
    this.router.get(
      this.path + "/",
      AuthMiddleware.authorization(true),
      errorMiddleware(SearchDto, "query", true),
      this.customerGroupController.getAll
    );
    this.router.post(
      this.path + "/",
      AuthMiddleware.authorization(true),
      errorMiddleware(CreateDto, "body", false),
      this.customerGroupController.create
    );
    this.router.put(
      this.path + "/update-publish/:id",
      AuthMiddleware.authorization(true),
      errorMiddleware(UpdatePublishDto, "body", false),
      this.customerGroupController.updatePublish
    );
    this.router.put(
      this.path + "/:id",
      AuthMiddleware.authorization(true),
      errorMiddleware(UpdateDto, "body", false),
      this.customerGroupController.update
    );
    this.router.delete(
      this.path + "/:id",
      AuthMiddleware.authorization(true),
      this.customerGroupController.delete
    );
  }
}

export default CustomerGroupRoute;
