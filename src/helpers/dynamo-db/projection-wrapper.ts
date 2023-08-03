import fromPairs from "lodash/fromPairs";
import { dynamoDBRecordBaseSchema } from "../../types/dynamo-db";

const baseKeys = Object.keys(dynamoDBRecordBaseSchema.shape);

const projectionWrapper = (
    fields?: Array<string>,
):
    | {
          ExpressionAttributeNames: Record<string, string>;
          ProjectionExpression: string;
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
