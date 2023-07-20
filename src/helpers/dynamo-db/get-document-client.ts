import * as DynamoDb from "aws-sdk/clients/dynamodb";

let client: DynamoDb.DocumentClient | null = null;

const getDocumentClient = (): DynamoDb.DocumentClient => {
    if (!client) {
        client = new DynamoDb.DocumentClient();
    }
    return client;
};

export default getDocumentClient;
