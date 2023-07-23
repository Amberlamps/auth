import { APIGatewayProxyEvent } from "aws-lambda";
import { getStringFromEnv } from "./get-env-variables";

const authUrl = getStringFromEnv("AUTH_URL");
const cookieName = getStringFromEnv("COOKIE_NAME");
const envCookieExpires = getStringFromEnv("COOKIE_EXPIRES_IN");
const cookieExpires = Number.parseInt(envCookieExpires, 10);
if (isNaN(cookieExpires)) {
    throw new Error("Invalid COOKIE_EXPIRES_IN");
}

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
