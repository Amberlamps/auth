import { DocumentClient } from "aws-sdk/clients/dynamodb";
import getDocumentClient from "./get-document-client";
import projectionWrapper from "./projection-wrapper";
import { getStringFromEnv } from "../../helpers/get-env-variables";
import validateSchema from "../../helpers/validate-schema";
import {
    ClientFunction,
    DynamoDBRecord,
    dynamoDBRecordSchema,
} from "../../types/dynamo-db";

const getRecord: ClientFunction<
    Omit<DocumentClient.GetItemInput, "Key"> & {
        Key: { pk: DynamoDBRecord["pk"]; sk: DynamoDBRecord["sk"] };
        fields?: Array<string>;
    },
    DynamoDBRecord | undefined
> = async (params) => {
    const { Item } = await getDocumentClient()
        .get({
            ...params,
            TableName: getStringFromEnv("TABLE_NAME"),
            ...projectionWrapper(params.fields),
        })
        .promise();

    return Item ? validateSchema(dynamoDBRecordSchema, Item) : undefined;
};

export default getRecord;
