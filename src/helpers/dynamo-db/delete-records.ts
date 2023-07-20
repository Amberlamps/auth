import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { chunk } from "lodash";
import { getStringFromEnv } from "../get-env-variables";
import getDocumentClient from "./get-document-client";

const dynamoDbTableName = getStringFromEnv("TABLE_NAME");

const deleteRecords = async (
    keys: Array<{ pk: string; sk: string }>,
): Promise<Array<DocumentClient.BatchWriteItemOutput>> =>
    Promise.all(
        chunk(keys, 25).map((chunks) =>
            getDocumentClient()
                .batchWrite({
                    RequestItems: {
                        [dynamoDbTableName]: chunks.map((Key) => ({
                            DeleteRequest: {
                                Key,
                            },
                        })),
                    },
                })
                .promise(),
        ),
    );

export default deleteRecords;
