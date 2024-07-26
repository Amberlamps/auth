import * as z from "zod";

export const googleProfileSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    picture: z.string().optional(),
});

export const googleIdTokenSchema = z.object({
    aud: z.string(),
    email: z.string(),
    name: z.string(),
    picture: z.string().optional(),
});
export type GoogleIdToken = z.infer<typeof googleIdTokenSchema>;

export const googleLoginSchema = z.object({
    code: z.string(),
});
