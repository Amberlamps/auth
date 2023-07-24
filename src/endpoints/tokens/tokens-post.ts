import middlewares from "../../helpers/middlewares";
import { getRefreshToken } from "../../helpers/refresh-tokens";
import {
    notFound,
    ok,
    serverError,
    unauthorized,
} from "../../helpers/http-responses";
import getRecord from "../../helpers/dynamo-db/get-record";
import { TokenResponse, tokenDbSchema } from "../../types/tokens";
import createAccessToken from "../../helpers/create-access-token";

export const handler = middlewares(async (event) => {
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

    const accessToken = await createAccessToken(tokenValidation.data);
    return ok<TokenResponse>({
        accessToken,
        user: {
            name: tokenValidation.data.name,
            userId: tokenValidation.data.userId,
            picture: tokenValidation.data.picture,
        },
    });
});
