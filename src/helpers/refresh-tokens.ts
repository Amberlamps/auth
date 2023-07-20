import { APIGatewayProxyEvent } from "aws-lambda";
import { getStringFromEnv } from "./get-env-variables";

const authUrl = getStringFromEnv("AUTH_URL");
const cookieName = process.env["COOKIE_NAME"] || "r_id";
const parsedExpires = Number.parseInt(process.env["COOKIE_EXPIRES"] || "", 10);
const cookieExpires = isNaN(parsedExpires)
    ? 60 * 60 * 24 * 365 * 10
    : parsedExpires;

const cookieParser = (
    cookieHeader: string,
): Array<{ key: string; value: string }> =>
    cookieHeader
        .split(";")
        .map((cookie) => {
            const [key, value] = cookie.split("=");
            return { key, value };
        })
        .filter((cookie) => cookie.key && cookie.value) as Array<{
        key: string;
        value: string;
    }>;

export const setRefreshToken = (token: string): string => {
    return `${cookieName}=${token}; Domain=${authUrl}; Path=/; Secure; HttpOnly; SameSite=None; Max-Age=${cookieExpires}`;
};

export const getRefreshToken = (
    event: APIGatewayProxyEvent,
): string | undefined => {
    const cookieHeader = event.headers["cookie"];
    if (cookieHeader) {
        const cookies = cookieParser(cookieHeader);
        const rId = cookies.find((cookie) => cookie.key === cookieName);
        if (rId) {
            return rId.value;
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
};
