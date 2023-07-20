import getRecord from "../../helpers/dynamo-db/get-record";
import { ok, unauthorized } from "../../helpers/http-responses";
import middlewares from "../../helpers/middlewares";
import { getRefreshToken } from "../../helpers/refresh-tokens";
import validateSchema from "../../helpers/validate-schema";
import { TokenDb, tokenDbSchema } from "../../types/tokens";

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
        return unauthorized({ message: "Token not found" });
    }
    const data = validateSchema(tokenDbSchema, item);
    return ok<TokenDb>({
        userId: data.userId,
        name: data.name,
        picture: data.picture,
    });
});
