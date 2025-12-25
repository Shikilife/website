// src/api.js

const DEFAULT_ORIGIN = "http://localhost:5000";

/**
 * ✅ 把 base 正規化成「一定以 /api 結尾」
 * 允許 env 寫：
 * - http://localhost:5000
 * - http://localhost:5000/
 * - http://localhost:5000/api
 * - http://localhost:5000/api/
 */
function normalizeBase(raw) {
  let base = String(raw || "").trim();
  if (!base) base = DEFAULT_ORIGIN;

  // 去尾巴 /
  base = base.replace(/\/+$/, "");

  // 確保最後是 /api
  if (!/\/api$/i.test(base)) base = `${base}/api`;

  return base;
}

const API_BASE = normalizeBase(import.meta.env.VITE_API_BASE_URL);

function getToken() {
  return localStorage.getItem("auth_token") || "";
}

/**
 * ✅ 統一組 URL
 * 允許你傳：
 * - "users"
 * - "/users"
 * - "api/users"
 * - "/api/users"
 * 都會變成： `${API_BASE}/users`
 */
function toUrl(path) {
  if (!path) return API_BASE;

  // 完整 URL 直接用
  if (/^https?:\/\//i.test(path)) return path;

  let p = String(path).trim();
  if (!p) return API_BASE;

  // 移除前面的 /
  p = p.replace(/^\/+/, "");

  // 如果你傳了 api/users，把 api/ 拿掉避免 /api/api/users
  p = p.replace(/^api\/+/i, "");

  return p ? `${API_BASE}/${p}` : API_BASE;
}

async function parseErrorBody(res) {
  const contentType = res.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return data?.message || data?.error || JSON.stringify(data);
    }
    const text = await res.text();
    return text || res.statusText || "Unknown error";
  } catch {
    return res.statusText || "Unknown error";
  }
}

async function request(path, { method = "GET", body } = {}) {
  const token = getToken();

  const headers = { Accept: "application/json" };
  if (body != null) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = toUrl(path);

  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    // 如果你之後改成 cookie session，才需要這行：
    // credentials: "include",
  });

  if (!res.ok) {
    const msg = await parseErrorBody(res);
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("auth_token");
    }
    throw new Error(`API ${res.status}: ${msg} (${url})`);
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();

  const text = await res.text();
  return text || null;
}

export const apiGet = (path) => request(path, { method: "GET" });
export const apiPost = (path, body) => request(path, { method: "POST", body });
export const apiPut = (path, body) => request(path, { method: "PUT", body });
export const apiDelete = (path) => request(path, { method: "DELETE" });
