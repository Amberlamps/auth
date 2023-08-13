import middlewares from "../../helpers/middlewares";
import { getRefreshToken } from "../../helpers/refresh-tokens";
import {
    notFound,
    ok,
    serverError,
    unauthorized,
} from "../../helpers/http-responses";
import getRecord from "../../helpers/dynamo-db/get-record";
import {
    ClientCredentialsGrantType,
    TokenResponse,
    tokenDbSchema,
    tokenPostSchema,
} from "../../types/tokens";
import createAccessToken from "../../helpers/create-access-token";
import validateSchema from "../../helpers/validate-schema";
import { APIGatewayProxyResult } from "aws-lambda";
import { clientDbSchema } from "../../types/clients";
import crypto from "crypto";

const getAccessTokenByCode = async (
    refreshToken: string,
): Promise<APIGatewayProxyResult> => {
    const item = await getRecord({
        Key: {
            pk: `TOKEN#${refreshToken}`,
            sk: "TOKEN",
        },
    });

    if (!item) {
        return notFound();
    }

    const tokenValidation = tokenDbSchema.safeParse(item);

    if (!tokenValidation.success) {
        return serverError();
    }
    const accessToken = await createAccessToken({
        ...tokenValidation.data,
        type: "user",
    });
    return ok<TokenResponse>({
        accessToken,
        type: "user",
        user: tokenValidation.data,
    });
};

// Function to check if a password matches the hashed version
async function checkPassword(
    password: string,
    hashedPassword: string,
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const [, part1, part2, part3] = hashedPassword.split(":");
        if (!part1 || !part2 || !part3) {
            return reject(new Error("Invalid hashed password"));
        }
        const iterations = parseInt(part1, 10);
        const salt = Buffer.from(part2, "hex");
        const hashBytes = 64;

        crypto.pbkdf2(
            password,
            salt,
            iterations,
            hashBytes,
            "sha512",
            (err, derivedKey) => {
                if (err) reject(err);
                resolve(derivedKey.toString("hex") === part3);
            },
        );
    });
}

const getAccessTokenByCredentials = async (
    payload: ClientCredentialsGrantType,
): Promise<APIGatewayProxyResult> => {
    const record = await getRecord({
        Key: {
            pk: `CLIENT#${payload.client_id}`,
            sk: "CLIENT",
        },
    });
    if (!record) {
        return notFound();
    }
    const clientValidation = clientDbSchema.safeParse(record);
    if (!clientValidation.success) {
        return serverError();
    }
    const client = clientValidation.data;
    const isValid = await checkPassword(
        payload.client_secret,
        client.clientSecretHash,
    );
    if (!isValid) {
        return unauthorized({ message: "Invalid client credentials" });
    }
    const accessToken = await createAccessToken({
        type: "client",
        clientId: client.clientId,
        createdAt: client.createdAt,
        name: client.name,
    });
    return ok<TokenResponse>({
        accessToken,
        type: "client",
        client: {
            clientId: client.clientId,
            createdAt: client.createdAt,
            name: client.name,
        },
    });
};

export const handler = middlewares(async (event) => {
    const payload = validateSchema(tokenPostSchema, event.body, "BAD_REQUEST");
    if (payload.grant_type === "client_credentials") {
        return getAccessTokenByCredentials(payload);
    }

    const refreshToken = getRefreshToken(event);
    if (!refreshToken) {
        return unauthorized({ message: "Missing cookies" });
    }
    return getAccessTokenByCode(refreshToken);
});
