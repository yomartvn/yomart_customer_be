import { AxiosError } from "axios";
import { apiMessages as messages } from "./axios.constant";

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

export const handleAxiosError = (
  error: AxiosError,
  fallbackMessage: string = messages.UNKNOWN_ERROR,
  throwError: boolean = true
) => {
  const errorResponse = {
    message: fallbackMessage,
    status: undefined as number | undefined,
    code: undefined as string | undefined,
    details: undefined as any,
  };

  if (error.response) {
    const { status, data } = error.response;
    errorResponse.status = status;

    // Trường hợp đặc biệt: server trả { statusCode, message, errors }
    if (
      typeof data === "object" &&
      data !== null &&
      "statusCode" in data &&
      "errors" in data
    ) {
      if (throwError) {
        throw new APIError(
          (data as any).message || messages.VALIDATION_FAILED,
          (data as any).statusCode,
          undefined,
          data
        );
      }
      return data;
    }

    const apiMessage =
      typeof data === "object" && data !== null && "message" in data
        ? (data as any).message
        : undefined;

    const apiDetails =
      typeof data === "object" && data !== null && "details" in data
        ? (data as any).details
        : undefined;

    switch (status) {
      case 400:
        errorResponse.message = apiMessage || messages.BAD_REQUEST;
        errorResponse.details = apiDetails || data;
        break;
      case 401:
        errorResponse.message = apiMessage || messages.UNAUTHORIZED;
        errorResponse.details = apiDetails;
        break;
      case 403:
        errorResponse.message = apiMessage || messages.FORBIDDEN;
        errorResponse.details = apiDetails;
        break;
      case 404:
        errorResponse.message = apiMessage || messages.NOT_FOUND;
        break;
      case 500:
        errorResponse.message = apiMessage || messages.SERVER_ERROR;
        break;
      default:
        errorResponse.message = apiMessage || fallbackMessage;
        errorResponse.details = data;
        break;
    }
  } else if (error.request) {
    errorResponse.message =
      error.code === "ECONNREFUSED"
        ? messages.UNABLE_TO_CONNECT_SERVER
        : fallbackMessage;
    errorResponse.code = error.code;
  } else {
    errorResponse.message = error.message || fallbackMessage;
  }

  if (throwError) {
    throw new APIError(
      errorResponse.message,
      errorResponse.status,
      errorResponse.code,
      errorResponse.details
    );
  }
  return errorResponse;
};
