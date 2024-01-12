import * as z from "zod";

export const securityTokenSchema = z.object({
    body: z.record(z.any()),
    securityTokenId: z.string(),
    clientId: z.string(),
});
export type SecurityToken = z.infer<typeof securityTokenSchema>;

export const securityTokensPostSchema = securityTokenSchema
    .pick({
        body: true,
    })
    .extend({
        expiresIn: z.union([z.number().positive(), z.string()]),
    });
