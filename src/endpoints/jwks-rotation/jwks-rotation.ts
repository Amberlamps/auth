import { SecretsManagerRotationHandler } from "aws-lambda";
import * as AWS from "@aws-sdk/client-secrets-manager";
import { toPairs } from "lodash";
import * as jose from "jose";
import { getStringFromEnv } from "../../helpers/get-env-variables";
import { JwkStored, JwksStored, jwksStoredSchema } from "../../types/jwks";
import ms from "ms";

const region = getStringFromEnv("AWS_REGION");
const client = new AWS.SecretsManager({ region });
const algorithm = "RS256";
const tokenExpiresIn = getStringFromEnv("TOKEN_EXPIRES_IN");
const tokenExpiresInMs = ms(tokenExpiresIn);

const randomString = (length: number): string => {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};

export const handler: SecretsManagerRotationHandler = async (event) => {
    const metadata = await client.describeSecret({ SecretId: event.SecretId });
    if (!metadata.RotationEnabled) {
        throw new Error("Secret rotation is not enabled for this secret.");
    }
    const versions = metadata.VersionIdsToStages;
    if (!versions) {
        throw new Error("No versions attached to the secret.");
    }
    const tokenVersion = versions[event.ClientRequestToken];
    if (!tokenVersion) {
        throw new Error("Secret version not found.");
    }
    if (tokenVersion.includes("AWSCURRENT")) {
        console.log(
            "Secret version is already set as AWSCURRENT for this secret.",
        );
        return;
    }
    if (!tokenVersion.includes("AWSPENDING")) {
        throw new Error(
            "Secret version is not set as AWSPENDING for this secret.",
        );
    }
    if (event.Step === "createSecret") {
        const currentValue = await client.getSecretValue({
            SecretId: event.SecretId,
            VersionStage: "AWSCURRENT",
        });
        try {
            await client.getSecretValue({
                SecretId: event.SecretId,
                VersionStage: "AWSPENDING",
                VersionId: event.ClientRequestToken,
            });
        } catch (error) {
            if (error instanceof AWS.ResourceNotFoundException) {
                const secretValidation = jwksStoredSchema.safeParse(
                    JSON.parse(currentValue.SecretString as string),
                );
                if (!secretValidation.success) {
                    console.error(secretValidation.error);
                    throw new Error("Invalid secret string.");
                }
                const { publicKey, privateKey } = await jose.generateKeyPair(
                    algorithm,
                );
                const key = (await jose.exportJWK(publicKey)) as {
                    kty: string;
                    e: string;
                    n: string;
                };
                const jwkStoredKey: JwkStored = {
                    ...key,
                    kid: randomString(20),
                    alg: algorithm,
                    createdAt: Date.now(),
                    privateKey: await jose.exportPKCS8(privateKey),
                    status: "current",
                    use: "sig",
                };
                const keys = secretValidation.data.keys
                    .filter(
                        (key) =>
                            key.status === "current" ||
                            (key.status === "previous" &&
                                Date.now() - key.createdAt < tokenExpiresInMs),
                    )
                    .map((key) => ({
                        ...key,
                        status: "previous",
                    })) as JwkStored[];
                const jwksStored: JwksStored = {
                    keys: [...keys, jwkStoredKey],
                };
                await client.putSecretValue({
                    SecretId: event.SecretId,
                    ClientRequestToken: event.ClientRequestToken,
                    SecretString: JSON.stringify(jwksStored),
                    VersionStages: ["AWSPENDING"],
                });
                return;
            }
            throw error;
        }
    } else if (event.Step === "finishSecret") {
        const currentVersion = toPairs(versions).find(([, stages]) =>
            stages.includes("AWSCURRENT"),
        );
        if (!currentVersion) {
            throw new Error("No current version found.");
        }
        if (currentVersion[0] !== event.ClientRequestToken) {
            await client.updateSecretVersionStage({
                SecretId: event.SecretId,
                VersionStage: "AWSCURRENT",
                MoveToVersionId: event.ClientRequestToken,
                RemoveFromVersionId: currentVersion[0],
            });
        }
    }
};
