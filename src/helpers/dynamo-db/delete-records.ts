import {
    BatchWriteCommandOutput,
    BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import chunk from "lodash/chunk";
import { getStringFromEnv } from "../get-env-variables";
import getDocumentClient from "./get-document-client";

const dynamoDbTableName = getStringFromEnv("TABLE_NAME");

const deleteRecords = async (
    keys: Array<{ pk: string; sk: string }>,
): Promise<Array<BatchWriteCommandOutput>> =>
    Promise.all(
        chunk(keys, 25).map((chunks) =>
            getDocumentClient().send(
                new BatchWriteCommand({
                    RequestItems: {
                        [dynamoDbTableName]: chunks.map((Key) => ({
                            DeleteRequest: {
                                Key,
                            },
                        })),
                    },
                }),
            ),
        ),
    );

export default deleteRecords;
