import { LoginGoogle } from "../../src/types/login";
import {
    TokenPost,
    TokenResponse,
    tokenResponseSchema,
} from "../../src/types/tokens";
import { fetcherAuth } from "./fetcher";
import * as z from "zod";

export const login = async (loginPost: LoginGoogle): Promise<TokenResponse> => {
    const response = await fetcherAuth("/login", {
        method: "POST",
        body: JSON.stringify(loginPost),
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    if (response.ok) {
        const tokenResponse = tokenResponseSchema.safeParse(
            await response.json(),
        );
        if (tokenResponse.success) {
            return tokenResponse.data;
        } else {
            console.error(tokenResponse.error);
            throw new Error("Invalid token response");
        }
    } else {
        console.error(response.body);
        throw new Error("Unknown error");
    }
};
export const fetchToken = async (
    tokenPost: TokenPost,
): Promise<TokenResponse> => {
    const response = await fetcherAuth("/tokens", {
        method: "POST",
        body: JSON.stringify(tokenPost),
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    if (response.ok) {
        const tokenResponse = tokenResponseSchema.safeParse(
            await response.json(),
        );
        if (tokenResponse.success) {
            return tokenResponse.data;
        } else {
            console.error(tokenResponse.error);
            throw new Error("Invalid token response");
        }
    } else {
        console.error(response.body);
        throw new Error("Unknown error");
    }
};

let intervalId: number | undefined = undefined;
let accessToken: string | undefined = undefined;

const getJwtValues = (
    token: string,
): {
    exp: number;
    iat: number;
} => {
    const [, payload] = token.split(".");
    if (payload) {
        const decoded = window.atob(payload);
        const payloadDecoded = z
            .object({ exp: z.number(), iat: z.number() })
            .safeParse(JSON.parse(decoded));
        if (payloadDecoded.success) {
            return payloadDecoded.data;
        } else {
            console.log(payloadDecoded.error);
        }
    }
    return {
        exp: 0,
        iat: 0,
    };
};

const isTokenExpired = (token: string): boolean => {
    const expiredAt = getJwtValues(token).exp;
    return expiredAt < Date.now() / 1000;
};

const setAccessToken = async (): Promise<TokenResponse> => {
    const tokenResponse = await fetchToken({
        type: "access-token",
    });
    accessToken = tokenResponse.accessToken;
    return tokenResponse;
};

export const getAccessToken = async (): Promise<string | undefined> => {
    if (accessToken && !isTokenExpired(accessToken)) {
        return accessToken;
    } else {
        if (intervalId) {
            window.clearInterval(intervalId);
        }
        try {
            const tokenResponse = await setAccessToken();
            const jwtValues = getJwtValues(tokenResponse.accessToken);
            intervalId = window.setInterval(
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                getAccessToken,
                (jwtValues.exp - jwtValues.iat) * 1000,
            );
            return tokenResponse.accessToken;
        } catch {
            return undefined;
        }
    }
};

export const clearAccessToken = (): void => {
    accessToken = undefined;
    if (intervalId) {
        window.clearInterval(intervalId);
    }
};
