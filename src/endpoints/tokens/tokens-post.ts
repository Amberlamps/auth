import { tokenPostSchema } from "../../types/tokens";
import validateSchema from "../../helpers/validate-schema";
import middlewares from "../../helpers/middlewares";
import getTokenByCookie from "./get-token-by-cookie";
import getTokenByGoogle from "./get-token-by-google";

export const handler = middlewares(async (event) => {
    const data = validateSchema(tokenPostSchema, event.body, "BAD_REQUEST");
    if (data.type === "google") {
        return getTokenByGoogle(data);
    } else {
        return getTokenByCookie(event);
    }
});
