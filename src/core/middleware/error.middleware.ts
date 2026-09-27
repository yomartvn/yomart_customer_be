import { Request, Response, NextFunction } from "express";
import { HttpException } from "@core/exceptions";
import Logger from "@core/utils/logger";
import messages from "@core/config/constants";

const errorMiddleware = (error: Error, req: Request, res: Response, _next: NextFunction) => {
    const status = error instanceof HttpException ? error.status : 500;
    const message = error.message || messages.SERVER_ERROR;

    Logger.error(`[ERROR] - Status: ${status} - Msg: ${message}`);
    if (process.env.NODE_ENV !== "production" && error.stack) {
        Logger.error(error.stack);
    }

    const payload: Record<string, unknown> = { statusCode: status, message };
    if (error instanceof HttpException && error.field) {
        payload.errors = [{ field: error.field, message: error.message }];
    }

    res.status(status).json(payload);
};
export default errorMiddleware;