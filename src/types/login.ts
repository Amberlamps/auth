import * as z from "zod";

const loginGoogleSchema = z.object({
    type: z.literal("google"),
    code: z.string(),
});
export type LoginGoogle = z.infer<typeof loginGoogleSchema>;

const loginGoogleTokenIdSchema = z.object({
    type: z.literal("google-token-id"),
    tokenId: z.string(),
});
export type LoginGoogleTokenId = z.infer<typeof loginGoogleTokenIdSchema>;

export const loginSchema = z.discriminatedUnion("type", [
    loginGoogleSchema,
    loginGoogleTokenIdSchema,
]);
