// src/api.js

const RAW_BASE = import.meta?.env?.VITE_API_BASE_URL || "";

// ✅ 去掉結尾的 /，避免 /api//users 這種怪路徑
const API_BASE = String(RAW_BASE).replace(/\/+$/, "") || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("auth_token") || "";
}

function toUrl(path) {
  if (!path) return API_BASE;

  // 完整 URL 直接用
  if (/^https?:\/\//i.test(path)) return path;

  // 確保 path 前面有 /
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
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
  });

  if (!res.ok) {
    const msg = await parseErrorBody(res);
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("auth_token");
    }
    // ✅ 把真正打到的 URL 印在錯誤裡，你一看就知道打去哪
    throw new Error(`API ${res.status}: ${msg} (${url})`);
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();

  const text = await res.text();
  return text || null;
}

export async function apiGet(path) {
  return request(path, { method: "GET" });
}
export async function apiPost(path, body) {
  return request(path, { method: "POST", body });
}
export async function apiPut(path, body) {
  return request(path, { method: "PUT", body });
}
export async function apiDelete(path) {
  return request(path, { method: "DELETE" });
}
