import * as z from "zod";

export const loginGoogleSchema = z.object({
    type: z.literal("google"),
    code: z.string(),
});
export type LoginGoogle = z.infer<typeof loginGoogleSchema>;
