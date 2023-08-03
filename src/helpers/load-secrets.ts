import { getStringFromEnv } from "./get-env-variables";
import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { JwkStored, JwksStored, jwksStoredSchema } from "../types/jwks";

const secretName = getStringFromEnv("JWKS_SECRET_NAME");
const region = getStringFromEnv("AWS_REGION");

export const loadSecrets = async (): Promise<JwksStored> => {
    const client = new SecretsManagerClient({
        region,
    });
    const response = await client.send(
        new GetSecretValueCommand({
            SecretId: secretName,
        }),
    );
    if (!response.SecretString) {
        throw new Error("Secret string is empty.");
    }
    const secretValidation = jwksStoredSchema.safeParse(
        JSON.parse(response.SecretString),
    );
    if (!secretValidation.success) {
        throw new Error("Secret string is not valid.");
    }

    return secretValidation.data;
};

export const loadCurrentSecret = async (): Promise<JwkStored> => {
    const secrets = await loadSecrets();
    const currentSecret = secrets.keys.find(
        (secret) => secret.status === "current",
    );
    if (!currentSecret) {
        throw new Error("Current secret not found.");
    }

    return currentSecret;
};
