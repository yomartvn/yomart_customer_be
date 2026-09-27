import path from "path";
import { createAxiosInstance } from "./axios.config";
import messages from "@core/config/constants";

const env = (process.env.NODE_ENV || "development").trim();
require("dotenv").config({ path: path.resolve(process.cwd(), `.env_${env}`) });
require("dotenv").config();

const joinUrl = (base?: string, version?: string) => {
  const b = String(base || "").replace(/\/$/, "");
  const v = String(version || "").replace(/\/$/, "");
  if (!b || !v) return "";
  return `${b}${v}`;
};

const apiVersion = process.env.API_VERSION;
const authApiUrl = process.env.AUTH_API_URL;
const sellerApiUrl = process.env.SELLER_API_URL;

if (!authApiUrl || !apiVersion) throw new Error(messages.CHECK_URL);
if (!sellerApiUrl || !apiVersion) throw new Error(messages.CHECK_URL);

const authAPI = (token?: string) =>
  createAxiosInstance({
    baseURL: authApiUrl + apiVersion,
    token,
  });

const sellerAPI = (token?: string) =>
  createAxiosInstance({
    baseURL: sellerApiUrl + apiVersion,
    token,
  });

const orderAPI = (token?: string) => {
  const orderBase = joinUrl(process.env.ORDER_API_URL, process.env.API_VERSION);
  if (!orderBase) throw new Error("ORDER_API_URL chưa được cấu hình");
  return createAxiosInstance({
    baseURL: orderBase,
    token,
    timeout: 120000,
  });
};

const apiMessages = {
  ...messages,
  UNABLE_TO_CONNECT_SERVER: "Không thể kết nối đến máy chủ",
  UNKNOWN_ERROR: "Lỗi không xác định",
  BAD_REQUEST: "Yêu cầu không hợp lệ",
  TOKEN_EXPIRED_OR_INVALID: "Token hết hạn hoặc không hợp lệ",
  NOT_FOUND: "Không tìm thấy",
  SERVER_ERROR: "Lỗi máy chủ",
  UNAUTHORIZED: "Không có quyền truy cập",
  FORBIDDEN: "Quyền truy cập bị từ chối",
  CONFLICT: "Xung đột",
};

export {
  authAPI,
  sellerAPI,
  orderAPI,
  apiMessages,
};
