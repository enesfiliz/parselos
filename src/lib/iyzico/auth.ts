import { createHmac, randomBytes } from "crypto";

export function createIyzicoAuthorizationHeader(
  apiKey: string,
  secretKey: string,
  uriPath: string,
  body: string,
) {
  const randomKey = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", secretKey)
    .update(randomKey + uriPath + body)
    .digest("hex");

  const token = Buffer.from(
    `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`,
    "utf8",
  ).toString("base64");

  return {
    authorization: `IYZWSv2 ${token}`,
    randomKey,
  };
}
