import { TokenDb } from "../types/tokens";
import { getStringFromEnv } from "./get-env-variables";
import * as AWS from "@aws-sdk/client-secrets-manager";
import * as jose from "jose";
import { jwksStoredSchema } from "../types/jwks";

const tokenExpiresIn = getStringFromEnv("TOKEN_EXPIRES_IN");
const secretName = getStringFromEnv("JWKS_SECRET_NAME");
const region = getStringFromEnv("AWS_REGION");
const authUrl = getStringFromEnv("AUTH_URL");

const createAccessToken = async (tokenDb: TokenDb): Promise<string> => {
    const client = new AWS.SecretsManager({
        region,
    });
    const response = await client.getSecretValue({
        SecretId: secretName,
        VersionStage: "AWSCURRENT",
    });
    if (!response.SecretString) {
        throw new Error("Secret string is empty.");
    }
    const secretValidation = jwksStoredSchema.safeParse(
        JSON.parse(response.SecretString),
    );
    if (!secretValidation.success) {
        throw new Error("Secret string is not valid.");
    }
    const currentSecret = secretValidation.data.keys.find(
        (secret) => secret.status === "current",
    );
    if (!currentSecret) {
        throw new Error("Current secret not found.");
    }

    const ecPrivateKey = await jose.importPKCS8(
        currentSecret.privateKey,
        currentSecret.alg,
    );

    const jwt = await new jose.SignJWT(tokenDb)
        .setProtectedHeader({ alg: currentSecret.alg, kid: currentSecret.kid })
        .setIssuedAt()
        .setIssuer(authUrl)
        .setExpirationTime(tokenExpiresIn)
        .sign(ecPrivateKey);

    return jwt;
};

export default createAccessToken;
