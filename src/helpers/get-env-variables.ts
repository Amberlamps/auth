import isNaN from "lodash/isNaN";

export const getStringFromEnv = (name: string): string => {
    const value = process.env[name];
    if (typeof value === "string") {
        return value;
    } else {
        throw new TypeError(`Cannot find env variable [${name}]`);
    }
};

export const getNumberFromEnv = (name: string): number => {
    const stringValue = getStringFromEnv(name);
    const value = Number.parseInt(stringValue, 10);
    if (isNaN(value)) {
        throw new TypeError(`Cannot parse env variable [${name}] as number`);
    } else {
        return value;
    }
};
