import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { ClientFunction, DynamoDBRecord } from "../../types/dynamo-db";
import { getStringFromEnv } from "../get-env-variables";
import getDocumentClient from "./get-document-client";

const dynamodbTable = getStringFromEnv("TABLE_NAME");

const createRecord: ClientFunction<
    Omit<DocumentClient.PutItemInput, "Item"> & { Item: DynamoDBRecord },
    DocumentClient.PutItemOutput
> = (params) =>
    getDocumentClient()
        .put({ ...params, TableName: dynamodbTable })
        .promise();

export default createRecord;
