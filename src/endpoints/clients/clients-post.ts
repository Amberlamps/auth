import middlewares from "../../helpers/middlewares";
import { created } from "../../helpers/http-responses";
import {
    Client,
    ClientDb,
    ClientResponse,
    clientPostSchema,
} from "../../types/clients";
import validateSchema from "../../helpers/validate-schema";
import { ulid, decodeTime } from "ulid";
import crypto from "crypto";
import createRecord from "../../helpers/dynamo-db/create-record";

// Function to hash a password with a salt
async function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const saltBytes = 32; // Size of the salt in bytes
        const iterations = 10000; // Number of iterations for PBKDF2
        const hashBytes = 64; // Size of the resulting hash in bytes
        const salt = crypto.randomBytes(saltBytes);

        crypto.pbkdf2(
            password,
            salt,
            iterations,
            hashBytes,
            "sha512",
            (err, derivedKey) => {
                if (err) reject(err);
                resolve(
                    `pbkdf2:${iterations}:${salt.toString(
                        "hex",
                    )}:${derivedKey.toString("hex")}`,
                );
            },
        );
    });
}

export const handler = middlewares(async (event) => {
    const clientPost = validateSchema(
        clientPostSchema,
        event.body,
        "BAD_REQUEST",
    );
    const clientId = ulid();
    const createdAt = decodeTime(clientId);
    const clientSecret = crypto.randomBytes(32).toString("hex");
    const client: Client = {
        clientId,
        createdAt,
        ...clientPost,
    };
    const clientSecretHash = await hashPassword(clientSecret);
    const clientDb: ClientDb = {
        ...client,
        clientSecretHash,
    };
    await createRecord({
        Item: {
            pk: `CLIENT#${clientId}`,
            sk: "CLIENT",
            ...clientDb,
        },
    });

    return created<ClientResponse>({
        ...client,
        clientSecret,
    });
});
