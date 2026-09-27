import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@core/utils";
import messages from "@core/config/constants";

class InternalAuthMiddleware {
    public static verify() {
        return (req: Request, res: Response, next: NextFunction) => {
            const expectedKey = process.env.INTERNAL_API_KEY;
            if (!expectedKey) {
                return sendResponse(res, 503, messages.INTERNAL_AUTH_NOT_CONFIGURED);
            }

            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (!token) {
                return sendResponse(res, 401, messages.INTERNAL_TOKEN_REQUIRED);
            }

            const tokenBuf = Buffer.from(token, "utf8");
            const expectedBuf = Buffer.from(expectedKey, "utf8");
            const isValid =
                tokenBuf.length === expectedBuf.length &&
                crypto.timingSafeEqual(
                    new Uint8Array(tokenBuf),
                    new Uint8Array(expectedBuf)
                );
            if (!isValid) {
                return sendResponse(res, 401, messages.INTERNAL_TOKEN_INVALID);
            }

            req.service_id = req.header("X-Service-Id") ?? undefined;
            next();
        };
    }
}

export default InternalAuthMiddleware;
