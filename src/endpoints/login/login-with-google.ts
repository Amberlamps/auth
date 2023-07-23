import { APIGatewayProxyResult } from "aws-lambda";
import { Login } from "../../types/login";
import { ok, serverError } from "../../helpers/http-responses";
import { OAuth2Client } from "google-auth-library";
import got from "got";
import { TokenDb, TokenResponse } from "../../types/tokens";
import { googleProfileSchema } from "../../types/google";
import { encodeEmail } from "../../helpers/emails";
import persistTokenDb from "../../helpers/persist-token-db";
import createAccessToken from "../../helpers/create-access-token";
import { setRefreshToken } from "../../helpers/refresh-tokens";

const loginWithGoogle = async (data: Login): Promise<APIGatewayProxyResult> => {
    const clientId = process.env["GOOGLE_CLIENT_ID"];
    const clientSecret = process.env["GOOGLE_CLIENT_SECRET"];
    if (!clientId || !clientSecret) {
        console.error("Missing Google credentials");
        return serverError();
    }
    const oAuth2Client = new OAuth2Client(
        clientId,
        clientSecret,
        "postmessage",
    );
    const { tokens } = await oAuth2Client.getToken(data.code);
    const { access_token: accessToken } = tokens;

    const response = await got(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
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
};

export default loginWithGoogle;