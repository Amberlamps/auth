import * as z from "zod";
import { clientSchema } from "./clients";

const codeGrantTypeSchema = z.object({
    grant_type: z.literal("authorization_code"),
});
export type CodeGrantType = z.infer<typeof codeGrantTypeSchema>;

const clientCredentialsGrantTypeSchema = z.object({
    grant_type: z.literal("client_credentials"),
    client_id: z.string(),
    client_secret: z.string(),
});
export type ClientCredentialsGrantType = z.infer<
    typeof clientCredentialsGrantTypeSchema
>;

export const tokenPostSchema = z.union([
    codeGrantTypeSchema,
    clientCredentialsGrantTypeSchema,
]);
export type TokenPost = z.infer<typeof tokenPostSchema>;

export const tokenDbSchema = z.object({
    userId: z.string(),
    name: z.string(),
    picture: z.string().optional(),
});
export type TokenDb = z.infer<typeof tokenDbSchema>;

const clientTokenResponseSchema = z.object({
    accessToken: z.string(),
    client: clientSchema,
    type: z.literal("client"),
});

const userTokenResponseSchema = z.object({
    accessToken: z.string(),
    user: tokenDbSchema,
    type: z.literal("user"),
});

export const tokenResponseSchema = z.union([
    clientTokenResponseSchema,
    userTokenResponseSchema,
]);
export type TokenResponse = z.infer<typeof tokenResponseSchema>;

const userAccessTokenSchema = tokenDbSchema.extend({
    type: z.literal("user"),
});
const clientAccessTokenSchema = clientSchema.extend({
    type: z.literal("client"),
});

export const accessTokenSchema = z.union([
    userAccessTokenSchema,
    clientAccessTokenSchema,
]);
export type AccessToken = z.infer<typeof accessTokenSchema>;
