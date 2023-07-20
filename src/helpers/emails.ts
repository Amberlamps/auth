import crypto from "crypto";

const salt = "LM4b7DSzaWNgbkawj8FX9J80HAuY5r";

export const encodeEmail = (email: string): string => {
    return crypto.createHash("sha256").update(salt).update(email).digest("hex");
};
