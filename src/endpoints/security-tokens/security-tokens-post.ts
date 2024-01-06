import middlewares from "../../helpers/middlewares";
import { created } from "../../helpers/http-responses";
import validateSchema from "../../helpers/validate-schema";
import { ulid } from "ulid";
import {
    SecurityToken,
    securityTokensPostSchema,
} from "../../types/security-tokens";
import verifyAccessToken from "../../helpers/verify-access-token";
import { TokenResponse } from "../../types/tokens";
import createAccessToken from "../../helpers/create-access-token";

export const handler = middlewares(async (event) => {
    const authorizationHeader = event.headers["authorization"];
    if (!authorizationHeader) {
        console.error("No authorization header provided");
        throw new Error("No authorization header provided");
    }
    const [, rawAccessToken] = authorizationHeader.split(" ");
    if (!rawAccessToken) {
        console.error("No bearer access token provided");
        throw new Error("No bearer access token provided");
    }
    const accessToken = await verifyAccessToken(rawAccessToken);
    if (accessToken.type !== "client") {
        console.error(
            "Invalid access token. Only clients can create security tokens.",
        );
        throw new Error(
            "Invalid access token. Only clients can create security tokens.",
        );
    }
    const securityTokensPost = validateSchema(
        securityTokensPostSchema,
        event.body,
        "BAD_REQUEST",
    );
    const securityTokenId = ulid();
    const securityToken: SecurityToken = {
        securityTokenId,
        body: securityTokensPost.body,
        expiresIn: securityTokensPost.expiresIn,
        clientId: accessToken.clientId,
    };
    const securityAccessToken = await createAccessToken(
        {
            type: "security-token",
            ...securityToken,
        },
        {
            tokenExpiresIn: "30m",
        },
    );
    return created<TokenResponse>({
        type: "security-token",
        accessToken: securityAccessToken,
        securityToken,
    });
});
