import Logger from "@core/utils/logger"
import { Response } from "express"
import { IErrors } from "@core/interfaces"

const CLIENT_ERROR_CODES = [400, 403, 404] as const

export default function sendResponse<T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
    field?: string | null,
    errors?: IErrors[] | null
) {
    Logger.info(message)

    if (field) {
        return res.status(200).json({
            statusCode,
            message,
            errors: [{ field, message }]
        })
    }

    if (errors) {
        return res.status(200).json({
            statusCode,
            message,
            errors
        })
    }

    const isClientError = CLIENT_ERROR_CODES.includes(statusCode as typeof CLIENT_ERROR_CODES[number])
    const httpStatus = isClientError ? 200 : statusCode

    return res.status(httpStatus).json({
        statusCode,
        message,
        ...(data ?? {})
    })
}