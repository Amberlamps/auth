import * as z from "zod";

const tokenGoogleSchema = z.object({
    type: z.literal("google"),
    accessToken: z.string(),
});
export type TokenGoogle = z.infer<typeof tokenGoogleSchema>;

export const tokenPostSchema = z.union([
    z.object({
        type: z.literal("access-token"),
    }),
    tokenGoogleSchema,
]);
export type TokenPost = z.infer<typeof tokenPostSchema>;

export const tokenDbSchema = z.object({
    userId: z.string(),
    name: z.string(),
    picture: z.string().optional(),
});
export type TokenDb = z.infer<typeof tokenDbSchema>;

export const tokenResponseSchema = z.object({
    accessToken: z.string(),
    user: tokenDbSchema,
});
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
