import * as z from "zod";

export const jwkSchema = z.object({
    alg: z.string(),
    kty: z.string(),
    use: z.string(),
    n: z.string(),
    e: z.string(),
    kid: z.string(),
});
export type Jwk = z.infer<typeof jwkSchema>;

export const jwksSchema = z.object({
    keys: jwkSchema.array(),
});
export type Jwks = z.infer<typeof jwksSchema>;

export const jwkStoredSchema = jwkSchema.pick({ kid: true, alg: true }).extend({
    privateKey: z.string(),
    publicKey: z.string(),
    createdAt: z.number(),
    status: z.enum(["current", "previous"]),
});
export type JwkStored = z.infer<typeof jwkStoredSchema>;

export const jwksStoredSchema = z.object({
    keys: jwkStoredSchema.array(),
});
export type JwksStored = z.infer<typeof jwksStoredSchema>;
