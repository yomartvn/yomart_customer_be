import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '@core/utils';
import messages from '@core/config/constants';
import { verifyToken } from '@apis/server/auth/auth';

class AuthMiddleware {
    public static authorization(isCheckPermission = false) {
        return this.authorizationWithPermissionCheck(isCheckPermission);
    }

    public static authorizationWithPermissionCheck = (isCheckPermission: boolean) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) return sendResponse(res, 401, messages.TOKEN_REQUIRED);

            const result = await verifyToken(token);
            // console.log('result', result);
            

            if (!result.ok) {
                const status = result.status === 401 ? 401 : result.status >= 500 ? 500 : 403;
                return sendResponse(res, status, result.message);
            }

            const { user } = result;
            if (user.active === 0) return sendResponse(res, 423, messages.USER_BLOCKED);

            req.id = user.id;
            const roleIds = user.role_ids ?? (user.role_id != null ? [user.role_id] : []);
            req.role_ids = roleIds;
            req.role_id = roleIds[0];
            req.seller_id = user.seller_id ?? undefined;

            next();
        };
    };
}
export default AuthMiddleware;
