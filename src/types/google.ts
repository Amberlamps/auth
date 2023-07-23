import * as z from "zod";

export const googleProfileSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    picture: z.string().optional(),
});

export const googleLoginSchema = z.object({
    code: z.string(),
});
