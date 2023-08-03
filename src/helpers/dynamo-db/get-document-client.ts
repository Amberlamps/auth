import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getStringFromEnv } from "../get-env-variables";

let client: DynamoDBDocumentClient | null = null;
const region = getStringFromEnv("AWS_REGION");

const getDocumentClient = (): DynamoDBDocumentClient => {
    if (!client) {
        client = DynamoDBDocumentClient.from(
            new DynamoDBClient({
                region,
            }),
        );
    }
    return client;
};

export default getDocumentClient;
