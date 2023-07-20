import { APIGatewayProxyResult } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { getStringFromEnv } from "./get-env-variables";

const appUrl = getStringFromEnv("APP_URL");

const corsWrapper = ({
    headers,
    ...restResult
}: APIGatewayProxyResult): APIGatewayProxyResult => ({
    ...restResult,
    headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods":
            "POST, GET, OPTIONS, DELETE, PUT, PATCH",
        "Access-Control-Allow-Origin": appUrl,
        "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
        ...headers,
    },
});

export function ok<T>(
    payload: T,
    options: Omit<APIGatewayProxyResult, "body" | "statusCode"> = {},
): APIGatewayProxyResult {
    return corsWrapper({
        ...options,
        body: JSON.stringify(payload),
        statusCode: StatusCodes.OK,
    });
}

export const notFound = (
    options: Omit<APIGatewayProxyResult, "body" | "statusCode"> = {},
): APIGatewayProxyResult =>
    corsWrapper({
        ...options,
        body: "",
        statusCode: StatusCodes.NOT_FOUND,
    });

export function created<T>(
    payload: T,
    options: Omit<APIGatewayProxyResult, "body" | "statusCode"> = {},
): APIGatewayProxyResult {
    return corsWrapper({
        ...options,
        body: JSON.stringify(payload),
        statusCode: StatusCodes.CREATED,
    });
}

export const noContent = (
    options: Omit<APIGatewayProxyResult, "body" | "statusCode"> = {},
): APIGatewayProxyResult =>
    corsWrapper({
        ...options,
        body: "",
        statusCode: StatusCodes.NO_CONTENT,
    });

export const badRequest = (
    payload: { message: string },
    options: Omit<APIGatewayProxyResult, "body" | "statusCode"> = {},
): APIGatewayProxyResult =>
    corsWrapper({
        ...options,
        body: JSON.stringify(payload),
        statusCode: StatusCodes.BAD_REQUEST,
    });

export const forbidden = (
    payload: { message: string },
    options: Omit<APIGatewayProxyResult, "body" | "statusCode"> = {},
): APIGatewayProxyResult =>
    corsWrapper({
        ...options,
        body: JSON.stringify(payload),
        statusCode: StatusCodes.FORBIDDEN,
    });

export const unauthorized = (
    payload: { message: string },
    options: Omit<APIGatewayProxyResult, "body" | "statusCode"> = {},
): APIGatewayProxyResult =>
    corsWrapper({
        ...options,
        body: JSON.stringify(payload),
        statusCode: StatusCodes.UNAUTHORIZED,
    });

export const conflict = (
    payload: { message: string },
    options: Omit<APIGatewayProxyResult, "body" | "statusCode"> = {},
): APIGatewayProxyResult =>
    corsWrapper({
        ...options,
        body: JSON.stringify(payload),
        statusCode: StatusCodes.CONFLICT,
    });

export const serverError = (
    options: Omit<APIGatewayProxyResult, "body" | "statusCode"> = {},
): APIGatewayProxyResult =>
    corsWrapper({
        ...options,
        body: "",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
