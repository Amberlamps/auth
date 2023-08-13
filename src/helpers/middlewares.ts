import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import httpSecurityHeaders from "@middy/http-security-headers";
import errorLogger from "@middy/error-logger";
import {
    APIGatewayProxyEvent,
    Handler,
    APIGatewayProxyResult,
} from "aws-lambda";

type JsonObject = { [Key in string]?: JsonValue };
interface JsonArray extends Array<JsonValue> {}
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export type PatchedEvent = Omit<APIGatewayProxyEvent, "body"> & {
    body: JsonValue;
    rawBody: string;
    rawHeaders: Record<string, string>;
} & APIGatewayProxyEvent;
export type PatchedGatewayHandler = Handler<
    PatchedEvent,
    APIGatewayProxyResult
>;

export default function middlewares(
    handler: PatchedGatewayHandler,
): PatchedGatewayHandler {
    return middy(handler)
        .use(httpJsonBodyParser())
        .use(httpHeaderNormalizer())
        .use(httpSecurityHeaders())
        .use(errorLogger())
        .use(httpErrorHandler());
}
