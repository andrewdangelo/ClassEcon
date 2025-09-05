// (Auth-aware fetch wrapper for your existing REST helpers like apiFetchStoreItemsByClass)
// =============================
import { store } from "../redux/store/store";
import { selectAccessToken } from "../redux/authSlice";

export async function http<T = any>(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<T> {
  const token = selectAccessToken(store.getState() as any);
  const headers = new Headers(init.headers || {});
  headers.set(
    "content-type",
    headers.get("content-type") || "application/json"
  );
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers, credentials: "include" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  // fallback
  // @ts-ignore
  return (await res.text()) as T;
}
