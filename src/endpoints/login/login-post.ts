import { loginGoogleSchema } from "../../types/login";
import validateSchema from "../../helpers/validate-schema";
import middlewares from "../../helpers/middlewares";
import loginWithGoogle from "./login-with-google";

export const handler = middlewares(async (event) => {
    const data = validateSchema(loginGoogleSchema, event.body, "BAD_REQUEST");
    return loginWithGoogle(data);
});
