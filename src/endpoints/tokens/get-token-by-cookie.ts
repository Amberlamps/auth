import { APIGatewayProxyResult } from "aws-lambda";
import { PatchedEvent } from "../../helpers/middlewares";
import { getRefreshToken } from "../../helpers/refresh-tokens";
import {
    notFound,
    ok,
    serverError,
    unauthorized,
} from "../../helpers/http-responses";
import getRecord from "../../helpers/dynamo-db/get-record";
import { TokenResponse, tokenDbSchema } from "../../types/tokens";
import createAccessToken from "./create-access-token";

const getTokenByCookie = async (
    event: PatchedEvent,
): Promise<APIGatewayProxyResult> => {
    const refreshToken = getRefreshToken(event);
    if (!refreshToken) {
        return unauthorized({ message: "Missing cookies" });
    }
    const item = await getRecord({
        Key: {
            pk: `TOKEN#${refreshToken}`,
            sk: "TOKEN",
        },
    });

    if (!item) {
        return notFound();
    }

    const tokenValidation = tokenDbSchema.safeParse(item);

    if (!tokenValidation.success) {
        return serverError();
    }

    return ok<TokenResponse>({
        accessToken: createAccessToken(tokenValidation.data),
        user: {
            name: tokenValidation.data.name,
            userId: tokenValidation.data.userId,
            picture: tokenValidation.data.picture,
        },
    });
};

export default getTokenByCookie;
