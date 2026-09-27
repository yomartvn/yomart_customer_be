import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@core/utils";
import messages from "@core/config/constants";
import { verifyToken } from "@apis/server/auth/auth";

class AdminAuthMiddleware {
  public static verify() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return sendResponse(res, 401, messages.TOKEN_REQUIRED);
      }

      try {
        const result = await verifyToken(token);
        if (!result.ok) {
          const status = result.status === 401 ? 401 : result.status >= 500 ? 500 : 403;
          return sendResponse(res, status, result.message);
        }

        const { user } = result;
        if (user.active === 0) return sendResponse(res, 423, messages.USER_BLOCKED);

        req.id = user.id;
        req.seller_id = user.seller_id ?? undefined;
        next();
      } catch (error) {
        return sendResponse(
          res,
          401,
          error instanceof Error ? error.message : messages.CANNOT_VERIFY_TOKEN
        );
      }
    };
  }
}

export default AdminAuthMiddleware;
