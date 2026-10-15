import CustomerController from "./customer.controller";
import { IRoute } from "@core/interfaces";
import { errorMiddleware } from "@core/middleware";
import { Router } from "express";
import { CreateDto } from "./dtos/create.dto";
import { AuthMiddleware } from "@core/middleware";
import { UpdateDto } from "./dtos/update.dto";
import { SearchDto } from "./dtos/search.dto";
import { UpdatePublishDto } from "./dtos/update-publish.dto";
import { CreateByRegisterDto } from "./dtos/create-by-register.dto";
import { UpdateFromProfileByIDDto } from "./dtos/update-from-profile-by-id.dto";
import { SellerResetCustomersDto } from "./dtos/seller-reset-customers.dto";

class CustomerRoute implements IRoute {
  public path = "/customer";
  public router = Router();

  public customerController = new CustomerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      this.path + "/get-by-id/:id",
      AuthMiddleware.authorization(true),
      this.customerController.getById
    );
    this.router.get(
      this.path + "/stats",
      AuthMiddleware.authorization(true),
      this.customerController.getStats
    );
    this.router.get(
      this.path + "/",
      AuthMiddleware.authorization(true),
      errorMiddleware(SearchDto, "query", true),
      this.customerController.getAll
    );
    this.router.post(
      this.path + "/seller/reset",
      AuthMiddleware.authorization(true),
      errorMiddleware(SellerResetCustomersDto, "body", true),
      this.customerController.sellerResetCustomers
    );
    this.router.post(
      this.path + "/createbyregister",
      AuthMiddleware.authorization(true),
      errorMiddleware(CreateByRegisterDto, "body", false),
      this.customerController.createByRegister
    );
    this.router.post(
      this.path + "/",
      AuthMiddleware.authorization(true),
      errorMiddleware(CreateDto, "body", false),
      this.customerController.create
    );
    this.router.put(
      this.path + "/update-from-profile-by-id/:id",
      AuthMiddleware.authorization(true),
      errorMiddleware(UpdateFromProfileByIDDto, "body", false),
      this.customerController.updateFromProfileByID
    );
    this.router.put(
      this.path + "/update-publish/:id",
      AuthMiddleware.authorization(true),
      errorMiddleware(UpdatePublishDto, "body", false),
      this.customerController.updatePublish
    );
    this.router.put(
      this.path + "/:id",
      AuthMiddleware.authorization(true),
      errorMiddleware(UpdateDto, "body", false),
      this.customerController.update
    );
    this.router.delete(
      this.path + "/:id",
      AuthMiddleware.authorization(true),
      this.customerController.delete
    );
  }
}

export default CustomerRoute;
