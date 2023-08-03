import * as z from "zod";
import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { unixSchema } from "./base";

export const dynamoDBRecordBaseSchema = z.object({
    createdAt: unixSchema,
    data1: z.string().optional(),
    data2: z.string().optional(),
    pk: z.string(),
    sk: z.string(),
});
export const dynamoDBRecordSchema = dynamoDBRecordBaseSchema.and(
    z.record(z.unknown()),
);

export type DynamoDBRecord = z.infer<typeof dynamoDBRecordSchema>;

export type ClientFunction<Input, Output> = (
    params: Omit<Input, "TableName">,
) => Promise<Output>;

export type QueryRecordsParams<T = string> = Omit<
    QueryCommandInput,
    "TableName"
> & {
    fields?: Array<T>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Key = Record<string, any>;
