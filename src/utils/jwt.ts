export const encodeJWT = (jwt: string) => Buffer.from(jwt).toString("base64");
