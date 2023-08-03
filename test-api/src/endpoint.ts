import { APIGatewayProxyHandler } from "aws-lambda";
import * as z from "zod";

// eslint-disable-next-line @typescript-eslint/require-await
export const handler: APIGatewayProxyHandler = async (event) => {
    const user = z
        .object({
            userId: z.string(),
            name: z.string().optional(),
            picture: z.string().optional(),
        })
        .parse(JSON.parse(event.requestContext.authorizer?.["user"] as string));
    return {
        statusCode: 200,
        body: JSON.stringify(user),
    };
};
