import {
    PutCommand,
    PutCommandInput,
    PutCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { ClientFunction, DynamoDBRecord } from "../../types/dynamo-db";
import { getStringFromEnv } from "../get-env-variables";
import getDocumentClient from "./get-document-client";

const dynamodbTable = getStringFromEnv("TABLE_NAME");

const createRecord: ClientFunction<
    Omit<PutCommandInput, "Item"> & { Item: DynamoDBRecord },
    PutCommandOutput
> = (params) =>
    getDocumentClient().send(
        new PutCommand({ ...params, TableName: dynamodbTable }),
    );

export default createRecord;
