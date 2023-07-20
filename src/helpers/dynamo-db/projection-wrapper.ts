import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { fromPairs } from "lodash";
import { dynamoDBRecordBaseSchema } from "../../types/dynamo-db";

const baseKeys = Object.keys(dynamoDBRecordBaseSchema.shape);

const projectionWrapper = (
    fields?: Array<string>,
):
    | {
          ExpressionAttributeNames: DocumentClient.ExpressionAttributeNameMap;
          ProjectionExpression: DocumentClient.ProjectionExpression;
      }
    | undefined => {
    if (fields && fields.length > 0) {
        const attributeNames = fromPairs(
            [...baseKeys, ...fields].map((field) => [`#${field}`, field]),
        );
        return {
            ExpressionAttributeNames: attributeNames,
            ProjectionExpression: Object.keys(attributeNames).join(", "),
        };
    } else {
        return undefined;
    }
};

export default projectionWrapper;
