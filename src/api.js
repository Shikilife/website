// src/api.js

/**
 * ✅ 從 localStorage 取 token（你可以自行統一 key 名稱）
 * 建議：token 存在 localStorage: "auth_token"
 */
function getToken() {
  return localStorage.getItem("auth_token") || "";
}

/**
 * ✅ 把後端錯誤內容整理成「人看得懂」的 message
 * - 優先吃 JSON: { message } / { error }
 * - 否則吃 text
 */
async function parseErrorBody(res) {
  const contentType = res.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const data = await res.json();
      const msg = data?.message || data?.error || JSON.stringify(data);
      return msg;
    }
    const text = await res.text();
    return text || res.statusText || "Unknown error";
  } catch {
    return res.statusText || "Unknown error";
  }
}

/**
 * ✅ 統一 request function
 * - 自動帶 Authorization: Bearer token
 * - 統一處理非 2xx
 */
async function request(path, { method = "GET", body } = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
  };

  // ✅ 有 token 才帶 Authorization（避免空字串造成後端誤判）
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  // ✅ 非 2xx：丟出更乾淨的錯誤
  if (!res.ok) {
    const msg = await parseErrorBody(res);

    // ✅ 可選：遇到 401/403 先清掉 token，避免一直卡死（你也可以拿掉）
    if (res.status === 401 || res.status === 403) {
      // 不要在這裡直接導頁，避免循環；只做「清掉 token」讓 app 自己處理
      localStorage.removeItem("auth_token");
    }

    throw new Error(`API ${res.status} ${res.statusText}: ${msg}`);
  }

  // ✅ 204 No Content：直接回 null（例如刪除成功）
  if (res.status === 204) return null;

  // ✅ 有些 API 可能回空字串，但狀態是 200
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

/** =========================
 * ✅ 你原本的 apiGet（保留）
 * ========================= */
export async function apiGet(path) {
  return request(path, { method: "GET" });
}

/** ✅ 常用：登入、建立、搜尋 */
export async function apiPost(path, body) {
  return request(path, { method: "POST", body });
}

/** ✅ 常用：更新資料 */
export async function apiPut(path, body) {
  return request(path, { method: "PUT", body });
}

/** ✅ 常用：刪除 */
export async function apiDelete(path) {
  return request(path, { method: "DELETE" });
}
