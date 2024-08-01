import { APIGatewayProxyResult } from "aws-lambda";
import { LoginGoogleTokenId } from "../../types/login";
import { badRequest, ok, serverError } from "../../helpers/http-responses";
import got from "got";
import { GoogleTokenIdResponse, TokenDb } from "../../types/tokens";
import { googleIdTokenSchema, GoogleIdToken } from "../../types/google";
import { encodeEmail } from "../../helpers/emails";
import persistTokenDb from "../../helpers/persist-token-db";
import createAccessToken from "../../helpers/create-access-token";

const getGooglePayload = async (
    tokenId: string,
): Promise<GoogleIdToken | undefined> => {
    try {
        const response = await got.post(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${tokenId}`,
        );
        // TODO: Need to add "exp" to schema and check if token has not expired yet
        return googleIdTokenSchema.parse(JSON.parse(response.body));
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

const loginWithGoogleTokenId = async (
    data: LoginGoogleTokenId,
): Promise<APIGatewayProxyResult> => {
    const clientId = process.env["GOOGLE_CLIENT_ID"];
    if (!clientId) {
        console.error("Missing Google credentials");
        return serverError();
    }
    const googlePayload = await getGooglePayload(data.tokenId);
    if (!googlePayload) {
        return badRequest({
            message: "Could not retrieve data for token id",
        });
    }
    const { name, email, picture, aud } = googlePayload;
    if (aud !== clientId) {
        return badRequest({
            message: "Audience does not match",
        });
    }
    const token: TokenDb = {
        name,
        userId: encodeEmail(email),
        picture,
    };
    const refreshToken = await persistTokenDb(token);
    const accessToken = await createAccessToken({
        ...token,
        type: "user",
    });
    return ok<GoogleTokenIdResponse>({
        accessToken,
        refreshToken,
        user: token,
    });
};

export default loginWithGoogleTokenId;
