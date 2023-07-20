import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

export default function validateSchema<T extends z.ZodTypeAny>(
    schema: T,
    payload: unknown,
    statusCode: keyof typeof StatusCodes = "INTERNAL_SERVER_ERROR",
): z.infer<typeof schema> {
    const validation = schema.safeParse(payload);
    if (validation.success) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return validation.data;
    } else {
        const error = createHttpError(
            StatusCodes[statusCode],
            JSON.stringify({
                errors: validation.error.errors,
                message: "Validation error",
            }),
        );
        console.log(error);
        throw error;
    }
}
