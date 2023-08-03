import * as jose from "jose";
import { JwkStored, JwksStored, Jwk, Jwks } from "../../types/jwks";

const algorithm = "RS256";

const randomString = (length: number): string => {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};

export const createJwkStoredKey = async (): Promise<JwkStored> => {
    const { publicKey, privateKey } = await jose.generateKeyPair(algorithm);
    const jwkStoredKey: JwkStored = {
        alg: algorithm,
        kid: randomString(20),
        createdAt: Date.now(),
        publicKey: await jose.exportSPKI(publicKey),
        privateKey: await jose.exportPKCS8(privateKey),
        status: "current",
    };

    return jwkStoredKey;
};

export const convertStoredToJwks = async (
    jwksStored: JwksStored,
): Promise<Jwks> => {
    const keys = await Promise.all(
        jwksStored.keys.map(async (storedKey) => {
            const key = (await jose.exportJWK(
                await jose.importSPKI(storedKey.publicKey, algorithm),
            )) as {
                kty: string;
                e: string;
                n: string;
            };
            const jwk: Jwk = {
                ...key,
                alg: algorithm,
                use: "sig",
                kid: storedKey.kid,
            };
            return jwk;
        }),
    );
    return {
        keys,
    };
};
