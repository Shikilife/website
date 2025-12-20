// src/data/accounts.js
// ✅ 單一資料來源：欄位統一 username/password/role/name

export const accounts = [
  // 管理者
  { id: 1, username: "admin", password: "admin", role: "管理員", name: "管理員A" },

  // 學生
  { id: 5, username: "122214217", password: "1234", role: "學生", name: "宸維" },
];

/**
 * ✅ Mock Login（假登入 API）
 * 讓 AuthModal.vue 可以像打後端一樣呼叫
 *
 * @param {{username:string, password:string, role:'student'|'admin'}} payload
 * @returns {Promise<{ok:boolean, token?:string, user?:object, message?:string}>}
 */
export async function mockLogin({ username, password, role }) {
  // 模擬延遲（看起來像真的在打 API）
  await new Promise((r) => setTimeout(r, 300));

  const acc = accounts.find(
    (a) => a.username === username && a.password === password
  );

  if (!acc) {
    return { ok: false, message: "帳號或密碼錯誤" };
  }

  // role 檢查（避免學生用 admin 身分登入）
  const wantAdmin = role === "admin";
  const isAdmin = acc.role === "管理員";

  if (wantAdmin !== isAdmin) {
    return { ok: false, message: "身份不符，請選擇正確的登入身份" };
  }

  // mock token：給 user store restoreSession 用
  const token = `mock_${acc.id}_${Date.now()}`;

  return {
    ok: true,
    token,
    user: {
      id: acc.id,
      username: acc.username,
      name: acc.name,
      isAdmin,
    },
  };
}

export default accounts;
