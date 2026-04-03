import type { ApiResponse } from "@/types/api";

async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? "Request failed");
  }
  return json.data as T;
}

export const api = {
  get: <T>(url: string) => fetchApi<T>(url),
  post: <T>(url: string, body: unknown) =>
    fetchApi<T>(url, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown) =>
    fetchApi<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(url: string) =>
    fetchApi<T>(url, { method: "DELETE" }),
};
