import { rateLimit } from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2,
  skipSuccessfulRequests: true,
  message: { statusCode: 429, message: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});
