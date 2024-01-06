import {
    APIGatewayAuthorizerHandler,
    APIGatewayAuthorizerResult,
} from "aws-lambda";
import { AccessToken } from "../../types/tokens";
import verifyAccessToken from "../../helpers/verify-access-token";

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

const getPrincipalId = (accessToken: AccessToken): string => {
    if (accessToken.type === "user") {
        return accessToken.userId;
    } else if (accessToken.type === "security-token") {
        return accessToken.securityTokenId;
    } else {
        return accessToken.clientId;
    }
};

export const handler: APIGatewayAuthorizerHandler = async (event) => {
    if (event.type === "TOKEN") {
        try {
            const [, accessToken] = event.authorizationToken.split(" ");
            if (!accessToken) {
                console.error("No bearer access token provided");
                return deniedAccess;
            }
            const entity = await verifyAccessToken(accessToken);
            return {
                principalId: getPrincipalId(entity),
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
                    entity: JSON.stringify(entity),
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
