import { Jwks, jwksSchema } from "../types/jwks";
import { loadSecrets } from "./load-secrets";
import { convertStoredToJwks } from "../endpoints/jwks-rotation/create-jwk-stored-key";
import * as jose from "jose";
import { AccessToken, accessTokenSchema } from "../types/tokens";

let jwks: Jwks | null = null;

const getJwks = async (): Promise<Jwks> => {
    if (jwks) {
        return jwks;
    }
    const envJwks = process.env["JWKS"];
    if (envJwks) {
        jwks = jwksSchema.parse(JSON.parse(envJwks));
        return jwks;
    } else {
        const secrets = await loadSecrets();
        const jwks = await convertStoredToJwks(secrets);
        return jwks;
    }
};

const verifyAccessToken = async (accessToken: string): Promise<AccessToken> => {
    const jwks = await getJwks();
    const { payload } = await jose.jwtVerify(
        accessToken,
        jose.createLocalJWKSet(jwks),
    );
    const tokenValidation = accessTokenSchema.safeParse(payload);
    if (!tokenValidation.success) {
        console.error(tokenValidation.error);
        throw new Error("Invalid token.");
    }
    const { data: entity } = tokenValidation;
    return entity;
};

export default verifyAccessToken;
