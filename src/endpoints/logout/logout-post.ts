import deleteRecords from "../../helpers/dynamo-db/delete-records";
import getRecord from "../../helpers/dynamo-db/get-record";
import queryRecords from "../../helpers/dynamo-db/query-records";
import { ok, unauthorized } from "../../helpers/http-responses";
import middlewares from "../../helpers/middlewares";
import { getRefreshToken } from "../../helpers/refresh-tokens";
import validateSchema from "../../helpers/validate-schema";
import { dynamoDBRecordSchema } from "../../types/dynamo-db";
import { tokenDbSchema } from "../../types/tokens";

export const handler = middlewares(async (event) => {
    const refreshToken = getRefreshToken(event);
    if (!refreshToken) {
        return unauthorized({ message: "Missing cookies" });
    }
    const item = await getRecord({
        Key: {
            pk: `TOKEN#${refreshToken}`,
            sk: "TOKEN",
        },
    });
    if (!item) {
        return ok({ message: "Successfully logged out!" });
    }
    const data = validateSchema(tokenDbSchema, item);
    const result = await queryRecords({
        KeyConditionExpression: "data1 = :data1 AND begins_with(pk, :pk)",
        ExpressionAttributeValues: {
            ":data1": `USER#${data.userId}`,
            ":pk": "TOKEN",
        },
        IndexName: "gsi1",
    });
    const records = validateSchema(
        dynamoDBRecordSchema.array(),
        result.records,
    );
    await deleteRecords(
        records.map((record) => ({
            pk: record.pk,
            sk: record.sk,
        })),
    );
    return ok({ message: "Successfully logged out" });
});
