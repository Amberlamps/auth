/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as z from "zod";
import { parseInt, isNaN } from "lodash";

function getUnixTime(date: string | number): number | undefined {
    const time = new Date(
        typeof date === "string" ? parseInt(date, 10) : date,
    ).getTime();
    return !isNaN(time) ? time : undefined;
}

export const unixSchema = z
    .number()
    .refine(
        (value: number | undefined | null) =>
            value ? !!getUnixTime(value) : true,
        {
            message: "Date needs to be a valid unix timestamp",
        },
    );

export const awsSecretSchema = z.object({
    smtpPassword: z.string(),
});
export type AwsSecret = z.infer<typeof awsSecretSchema>;