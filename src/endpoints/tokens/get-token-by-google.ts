import { APIGatewayProxyResult } from "aws-lambda";
import got from "got";
import {
    TokenDb,
    TokenGoogle,
    TokenResponse,
    googleProfileSchema,
} from "../../types/tokens";
import crypto from "crypto";
import createRecord from "../../helpers/dynamo-db/create-record";
import { ok, unauthorized } from "../../helpers/http-responses";
import createAccessToken from "./create-access-token";
import { setRefreshToken } from "../../helpers/refresh-tokens";
import { encodeEmail } from "../../helpers/emails";

const persistTokenDb = async (tokenDb: TokenDb): Promise<string> => {
    const id = crypto.randomBytes(32).toString("hex");
    await createRecord({
        Item: {
            pk: `TOKEN#${id}`,
            sk: "TOKEN",
            data1: `USER#${tokenDb.userId}`,
            createdAt: Date.now(),
            ...tokenDb,
        },
    });
    return id;
};

const getTokenByGoogle = async (
    tokenGoogle: TokenGoogle,
): Promise<APIGatewayProxyResult> => {
    try {
        const response = await got(
            `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenGoogle.accessToken}`,
            {
                headers: {
                    Authorization: `Bearer ${tokenGoogle.accessToken}`,
                    Accept: "application/json",
                },
            },
        );
        const { name, email, picture } = googleProfileSchema.parse(
            JSON.parse(response.body),
        );
        const token: TokenDb = {
            name,
            userId: encodeEmail(email),
            picture,
        };
        const id = await persistTokenDb(token);
        return ok<TokenResponse>(
            {
                accessToken: createAccessToken(token),
                user: token,
            },
            {
                headers: {
                    "Set-Cookie": setRefreshToken(id),
                },
            },
        );
    } catch (error) {
        console.error(error);
        return unauthorized({ message: "Invalid access token!" });
    }
};

export default getTokenByGoogle;
