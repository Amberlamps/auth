import {
    APIGatewayAuthorizerHandler,
    APIGatewayAuthorizerResult,
} from "aws-lambda";
import { Jwks, jwksSchema } from "../../types/jwks";
import { loadSecrets } from "../../helpers/load-secrets";
import { convertStoredToJwks } from "../jwks-rotation/create-jwk-stored-key";
import * as jose from "jose";
import { tokenDbSchema } from "../../types/tokens";

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

const deniedAccess: APIGatewayAuthorizerResult = {
    policyDocument: {
        Version: "2012-10-17",
        Statement: [
            {
                Action: "execute-api:Invoke",
                Effect: "Deny",
                Resource: "*",
            },
        ],
    },
    principalId: "unauthorized",
};

export const handler: APIGatewayAuthorizerHandler = async (event) => {
    if (event.type === "TOKEN") {
        try {
            const jwks = await getJwks();
            const [, accessToken] = event.authorizationToken.split(" ");
            if (!accessToken) {
                console.error("No bearer access token provided");
                return deniedAccess;
            }
            const { payload } = await jose.jwtVerify(
                accessToken,
                jose.createLocalJWKSet(jwks),
            );
            const tokenValidation = tokenDbSchema.safeParse(payload);
            if (!tokenValidation.success) {
                console.error(tokenValidation.error);
                throw new Error("Invalid token.");
            }
            const { data: user } = tokenValidation;
            return {
                principalId: user.userId,
                policyDocument: {
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Action: "execute-api:Invoke",
                            Effect: "Allow",
                            Resource: "*",
                        },
                    ],
                },
                context: {
                    user: JSON.stringify(user),
                },
            };
        } catch (error) {
            console.error(error);
            return deniedAccess;
        }
    } else {
        console.error("The authorizer is only implemented for TOKEN type");
        return deniedAccess;
    }
};
