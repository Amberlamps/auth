import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const createPageToken = (pageToken: DocumentClient.Key): string =>
    Buffer.from(JSON.stringify(pageToken)).toString("base64");

export const getPageToken = (
    pageToken: string,
): DocumentClient.Key | undefined => {
    try {
        return JSON.parse(
            Buffer.from(decodeURIComponent(pageToken), "base64").toString(),
        ) as DocumentClient.Key;
    } catch (error) {
        console.log(error);
        return undefined;
    }
};
