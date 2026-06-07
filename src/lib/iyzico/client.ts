import "server-only";

import { createIyzicoAuthorizationHeader } from "@/lib/iyzico/auth";

type IyzicoConfig = {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
};

export type IyzicoResponse<T> = {
  status: "success" | "failure";
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  systemTime?: number;
} & T;

function getIyzicoConfig(): IyzicoConfig {
  const apiKey = process.env.IYZICO_API_KEY?.trim();
  const secretKey = process.env.IYZICO_SECRET_KEY?.trim();

  if (!apiKey || !secretKey) {
    throw new Error("IYZICO_API_KEY ve IYZICO_SECRET_KEY tanımlı olmalı.");
  }

  const baseUrl =
    process.env.IYZICO_BASE_URL?.trim() ||
    (process.env.NODE_ENV === "production"
      ? "https://api.iyzipay.com"
      : "https://sandbox-api.iyzipay.com");

  return { apiKey, secretKey, baseUrl };
}

export async function iyzicoRequest<T extends Record<string, unknown>>(
  uriPath: string,
  payload: Record<string, unknown>,
): Promise<IyzicoResponse<T>> {
  const { apiKey, secretKey, baseUrl } = getIyzicoConfig();
  const body = JSON.stringify(payload);
  const { authorization } = createIyzicoAuthorizationHeader(
    apiKey,
    secretKey,
    uriPath,
    body,
  );

  const response = await fetch(`${baseUrl}${uriPath}`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const data = (await response.json()) as IyzicoResponse<T>;

  if (!response.ok || data.status === "failure") {
    throw new Error(
      data.errorMessage ||
        data.errorCode ||
        `Iyzico isteği başarısız (${response.status}).`,
    );
  }

  return data;
}
