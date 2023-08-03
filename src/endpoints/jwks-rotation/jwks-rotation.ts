import { SecretsManagerRotationHandler } from "aws-lambda";
import {
    SecretsManagerClient,
    GetSecretValueCommand,
    DescribeSecretCommand,
    PutSecretValueCommand,
    ResourceNotFoundException,
    UpdateSecretVersionStageCommand,
} from "@aws-sdk/client-secrets-manager";
import {
    LambdaClient,
    GetFunctionConfigurationCommand,
    UpdateFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";
import toPairs from "lodash/toPairs";
import { getStringFromEnv } from "../../helpers/get-env-variables";
import { JwkStored, JwksStored, jwksStoredSchema } from "../../types/jwks";
import ms from "ms";
import {
    createJwkStoredKey,
    convertStoredToJwks,
} from "./create-jwk-stored-key";

const region = getStringFromEnv("AWS_REGION");
const client = new SecretsManagerClient({ region });
const tokenExpiresIn = getStringFromEnv("TOKEN_EXPIRES_IN");
const tokenExpiresInMs = ms(tokenExpiresIn);
const functionName = getStringFromEnv("FUNCTION_NAME");
const lambdaClient = new LambdaClient({ region });

const getCurrentValue = async (
    secretId: string,
): Promise<string | undefined> => {
    try {
        const currentValue = await client.send(
            new GetSecretValueCommand({
                SecretId: secretId,
                VersionStage: "AWSCURRENT",
            }),
        );
        return currentValue.SecretString as string;
    } catch {
        return undefined;
    }
};

const updateExistingKeys = (
    secretString: string | undefined,
): Array<JwkStored> => {
    if (!secretString) {
        return [];
    }

    const secretValidation = jwksStoredSchema.safeParse(
        JSON.parse(secretString),
    );
    if (!secretValidation.success) {
        console.error(secretValidation.error);
        throw new Error("Invalid secret string.");
    }
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
        })) as Array<JwkStored>;

    return keys;
};

export const handler: SecretsManagerRotationHandler = async (event) => {
    const metadata = await client.send(
        new DescribeSecretCommand({ SecretId: event.SecretId }),
    );
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
        const currentValue = await getCurrentValue(event.SecretId);
        try {
            await client.send(
                new GetSecretValueCommand({
                    SecretId: event.SecretId,
                    VersionStage: "AWSPENDING",
                    VersionId: event.ClientRequestToken,
                }),
            );
        } catch (error) {
            if (error instanceof ResourceNotFoundException) {
                const keys = updateExistingKeys(currentValue);
                const jwkStoredKey = await createJwkStoredKey();
                const jwksStored: JwksStored = {
                    keys: [...keys, jwkStoredKey],
                };
                await client.send(
                    new PutSecretValueCommand({
                        SecretId: event.SecretId,
                        ClientRequestToken: event.ClientRequestToken,
                        SecretString: JSON.stringify(jwksStored),
                        VersionStages: ["AWSPENDING"],
                    }),
                );
                const configuration = await lambdaClient.send(
                    new GetFunctionConfigurationCommand({
                        FunctionName: functionName,
                    }),
                );
                const envVars = configuration.Environment?.Variables || {};
                await lambdaClient.send(
                    new UpdateFunctionConfigurationCommand({
                        FunctionName: functionName,
                        Environment: {
                            Variables: {
                                ...envVars,
                                JWKS: JSON.stringify(
                                    await convertStoredToJwks(jwksStored),
                                ),
                            },
                        },
                    }),
                );

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
            await client.send(
                new UpdateSecretVersionStageCommand({
                    SecretId: event.SecretId,
                    VersionStage: "AWSCURRENT",
                    MoveToVersionId: event.ClientRequestToken,
                    RemoveFromVersionId: currentVersion[0],
                }),
            );
        }
    }
};
