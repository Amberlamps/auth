import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { getStringFromEnv } from "../get-env-variables";
import { QueryRecordsParams } from "../../types/dynamo-db";
import getDocumentClient from "./get-document-client";
import { createPageToken } from "./page-token";
import projectionWrapper from "./projection-wrapper";

const dynamodbTable = getStringFromEnv("TABLE_NAME");

interface PaginateRecordsResult {
    records: Array<unknown>;
    LastEvaluatedKey?: DocumentClient.Key;
}

type PaginateRecords = (
    params: QueryRecordsParams,
    tempItems?: Array<unknown>,
) => Promise<PaginateRecordsResult>;

const paginateRecords: PaginateRecords = async (params, tempItems = []) => {
    const { fields, ...restParams } = params;
    const projections = projectionWrapper(fields);
    const query: DocumentClient.QueryInput = {
        ...restParams,
        TableName: dynamodbTable,
    };
    if (projections) {
        query.ExpressionAttributeNames = {
            ...query.ExpressionAttributeNames,
            ...projections.ExpressionAttributeNames,
        };
        query.ProjectionExpression = projections.ProjectionExpression;
    }
    const { Items: newItems, LastEvaluatedKey } = await getDocumentClient()
        .query(query)
        .promise();
    const items = [...tempItems, ...(newItems || [])];
    return params.Limit && items.length < params.Limit && LastEvaluatedKey
        ? paginateRecords(
              {
                  ...params,
                  ExclusiveStartKey: LastEvaluatedKey,
              },
              items,
          )
        : {
              records: items,
              LastEvaluatedKey,
          };
};

interface QueryRecordsResponse {
    records: Array<unknown>;
    nextPageToken?: string;
}

export type QueryRecords = (
    params: QueryRecordsParams,
) => Promise<QueryRecordsResponse>;

const queryRecords: QueryRecords = async (params) => {
    const { records, LastEvaluatedKey } = await paginateRecords(params);
    const response: QueryRecordsResponse = { records };
    if (LastEvaluatedKey) {
        response.nextPageToken = createPageToken(LastEvaluatedKey);
    }
    return response;
};

export default queryRecords;
