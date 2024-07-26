import { loginSchema } from "../../types/login";
import validateSchema from "../../helpers/validate-schema";
import middlewares from "../../helpers/middlewares";
import loginWithGoogle from "./login-with-google";
import loginWithGoogleTokenId from "./login-with-google-token-id";

export const handler = middlewares(async (event) => {
    const data = validateSchema(loginSchema, event.body, "BAD_REQUEST");
    if (data.type === "google") {
        return loginWithGoogle(data);
    } else {
        return loginWithGoogleTokenId(data);
    }
});
