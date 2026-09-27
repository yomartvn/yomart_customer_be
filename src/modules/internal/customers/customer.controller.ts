import { NextFunction, Request, Response } from "express";
import message from "@core/config/constants";
import { sendResponse } from "@core/utils";
import InternalCustomerService from "./customer.service";

class InternalCustomerController {
  private customerService = new InternalCustomerService();

  public getByIds = async (req: Request, res: Response, next: NextFunction) => {
    const { listId } = req.body as { listId: number[] };

    try {
      const data = await this.customerService.getByIds(listId);
      return sendResponse(res, 200, message.FIND_ALL_SUCCESS, { data });
    } catch (error) {
      next(error);
    }
  };
}

export default InternalCustomerController;
