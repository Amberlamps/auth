// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const authUrl = import.meta.env.VITE_AUTH_URL;

if (typeof authUrl !== "string") {
    throw new Error("VITE_AUTH_URL is undefined");
}

const fetcher =
    (
        baseUrl: string,
    ): ((url: string, init?: RequestInit) => Promise<Response>) =>
    (url: string, init?: RequestInit): Promise<Response> =>
        fetch(`${baseUrl}${url}`, init);

export const fetcherAuth = fetcher(authUrl);
