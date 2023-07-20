import { TokenDb } from "../../types/tokens";
import jwt from "jsonwebtoken";

const JWT_SECRET = "wytX8PJhDqZNJ17x76vridr47xng2K1ntzjUDCpXsxfCXExB7U";

const createAccessToken = (tokenDb: TokenDb): string => {
    return jwt.sign(tokenDb, JWT_SECRET, {
        expiresIn: "15m",
    });
};

export default createAccessToken;
