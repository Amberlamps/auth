import * as z from "zod";
import { idSchema, unixSchema } from "./base";

export const clientPostSchema = z.object({
    name: z.string().min(3).max(50),
});
export type ClientPost = z.infer<typeof clientPostSchema>;

export const clientSchema = clientPostSchema.extend({
    clientId: idSchema,
    createdAt: unixSchema,
});
export type Client = z.infer<typeof clientSchema>;

export const clientDbSchema = clientSchema.extend({
    clientSecretHash: z.string(),
});
export type ClientDb = z.infer<typeof clientDbSchema>;

export const clientResponseSchema = clientSchema.extend({
    clientSecret: z.string(),
});
export type ClientResponse = z.infer<typeof clientResponseSchema>;
