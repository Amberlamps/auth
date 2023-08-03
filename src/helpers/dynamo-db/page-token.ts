import { Key } from "../../types/dynamo-db";

export const createPageToken = (pageToken: Key): string =>
    Buffer.from(JSON.stringify(pageToken)).toString("base64");

export const getPageToken = (pageToken: string): Key | undefined => {
    try {
        return JSON.parse(
            Buffer.from(decodeURIComponent(pageToken), "base64").toString(),
        ) as Key;
    } catch (error) {
        console.log(error);
        return undefined;
    }
};
