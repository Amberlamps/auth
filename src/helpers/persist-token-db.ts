import { TokenDb } from "../types/tokens";
import createRecord from "./dynamo-db/create-record";
import crypto from "crypto";

const persistTokenDb = async (tokenDb: TokenDb): Promise<string> => {
    const id = crypto.randomBytes(32).toString("hex");
    await createRecord({
        Item: {
            pk: `TOKEN#${id}`,
            sk: "TOKEN",
            data1: `USER#${tokenDb.userId}`,
            createdAt: Date.now(),
            ...tokenDb,
        },
    });
    return id;
};

export default persistTokenDb;
