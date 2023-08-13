import { AccessToken } from "../types/tokens";
import { getStringFromEnv } from "./get-env-variables";
import * as jose from "jose";
import { loadCurrentSecret } from "./load-secrets";

const tokenExpiresIn = getStringFromEnv("TOKEN_EXPIRES_IN");
const authUrl = getStringFromEnv("AUTH_URL");

const createAccessToken = async (accessToken: AccessToken): Promise<string> => {
    const currentSecret = await loadCurrentSecret();
    const ecPrivateKey = await jose.importPKCS8(
        currentSecret.privateKey,
        currentSecret.alg,
    );

    const jwt = await new jose.SignJWT(accessToken)
        .setProtectedHeader({ alg: currentSecret.alg, kid: currentSecret.kid })
        .setIssuedAt()
        .setIssuer(authUrl)
        .setExpirationTime(tokenExpiresIn)
        .sign(ecPrivateKey);

    return jwt;
};

export default createAccessToken;
