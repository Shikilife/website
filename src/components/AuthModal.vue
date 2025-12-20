<template>
  <div class="p3-modal" @click.self="close">
    <div class="p3-modal-card p3-card">
      <div class="p3-modal-head">
        <div class="p3-modal-title">
          <span class="p3-modal-badge">AUTH</span>
          <span class="title-text">請選擇身份 / 登入</span>
        </div>
        <button class="p3-x" @click="close" aria-label="close">✕</button>
      </div>

      <!-- 身分選擇 -->
      <div v-if="step === 'select'" class="p3-select-grid">
        <button class="p3-role-card role-student" @click="go('student')">
          <div class="p3-icon-wrapper">
            <div class="p3-glow-orb cyan"></div>
            <div class="p3-role-emoji">👨‍🎓</div>
          </div>
          <div class="p3-role-info">
            <div class="p3-role-title">學生</div>
            <div class="p3-role-sub">查詢 / 收藏 / 預選</div>
          </div>
          <div class="card-shine"></div>
        </button>

        <button class="p3-role-card role-admin" @click="go('admin')">
          <div class="p3-icon-wrapper">
            <div class="p3-glow-orb gold"></div>
            <div class="p3-role-emoji">🛡️</div>
          </div>
          <div class="p3-role-info">
            <div class="p3-role-title">管理者</div>
            <div class="p3-role-sub">匯入 / 管理課程 / 管理帳號</div>
          </div>
          <div class="card-shine"></div>
        </button>

        <div class="p3-row">
          <button class="p3-btn p3-btn-ghost w-full" @click="close">
            <span class="btn-content">取消</span>
          </button>
        </div>
      </div>

      <!-- 登入表單 -->
      <div v-else class="p3-form fade-in">
        <div class="p3-form-head">
          <div class="p3-form-kicker">
            {{ step === 'student' ? 'STUDENT' : 'ADMIN' }} LOGIN
          </div>
          <div class="p3-form-title">
            {{ step === 'student' ? '學生登入' : '管理者登入' }}
          </div>
        </div>

        <div v-if="errorMsg" class="p3-alert">
          <span>⚠️</span> {{ errorMsg }}
        </div>

        <label class="p3-label">
          {{ step === 'student' ? '學號 / 帳號' : '帳號' }}
        </label>
        <input
          v-model.trim="username"
          class="p3-input"
          :placeholder="step === 'student' ? '例如：122214217' : '例如：admin'"
          @keyup.enter="handleLogin"
          :disabled="isLoading"
        />

        <label class="p3-label mt">密碼</label>
        <input
          v-model="password"
          type="password"
          class="p3-input"
          placeholder="請輸入密碼"
          @keyup.enter="handleLogin"
          :disabled="isLoading"
        />

        <div class="p3-actions">
          <button class="p3-btn p3-btn-primary" @click="handleLogin" :disabled="isLoading || !username || !password">
            <span class="btn-content">{{ isLoading ? "登入中..." : "登入" }}</span>
            <div class="btn-shine"></div>
          </button>

          <button class="p3-btn p3-btn-ghost" @click="back" :disabled="isLoading">
            <span class="btn-content">返回</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { mockLogin } from "@/data/accounts";
import { useUserStore } from "@/stores/user";

const emit = defineEmits(["close"]);
const router = useRouter();
const user = useUserStore();

// ✅ 開關：現在先用假登入；後端完成後改成 false
const USE_MOCK_LOGIN = true;

const step = ref("select"); // 'select' | 'student' | 'admin'
const username = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMsg = ref("");

function resetFields() {
  username.value = "";
  password.value = "";
  errorMsg.value = "";
  isLoading.value = false;
}

/**
 * ✅ 修法 A：close(force)
 * - 使用者點 X / 點背景：close() → 如果 isLoading 就不給關
 * - 登入成功：close(true) → 強制關閉，不受 isLoading 限制
 */
function close(force = false) {
  if (isLoading.value && !force) return;
  resetFields();
  step.value = "select";
  emit("close");
}

function go(next) {
  resetFields();
  step.value = next;
}

function back() {
  go("select");
}

/**
 * ✅ 統一登入入口：先 mock，後端完成再切回 API
 * 後端建議規格（你可轉告後端）：
 * POST /api/auth/login
 * body: { username, password, role: 'student'|'admin' }
 * resp: { ok: true, token, user: { id, username, name, isAdmin, ... } }
 */
async function handleLogin() {
  errorMsg.value = "";

  if (step.value !== "student" && step.value !== "admin") {
    errorMsg.value = "請先選擇身份";
    return;
  }

  if (!username.value || !password.value) {
    errorMsg.value = "請輸入帳號與密碼";
    return;
  }

  isLoading.value = true;

  try {
    let data = null;

    // =========================
    // ✅ 1) Mock Login（現在可用）
    // =========================
    if (USE_MOCK_LOGIN) {
      data = await mockLogin({
        username: username.value,
        password: password.value,
        role: step.value,
      });
    } else {
      // =========================
      // ✅ 2) Real API（後端完成再開）
      // =========================
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: username.value,
          password: password.value,
          role: step.value,
        }),
      });

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          (res.status === 401 ? "帳號或密碼錯誤" : "登入失敗，請稍後再試");
        errorMsg.value = msg;
        return;
      }
    }

    // =========================
    // ✅ 共用：資料檢查 + 寫入 Store
    // =========================
    if (!data || data.ok === false) {
      errorMsg.value = data?.message || "帳號或密碼錯誤";
      return;
    }

    const token = data?.token || "";
    const u = data?.user || null;

    if (!u) {
      errorMsg.value = "登入成功但缺少 user 資料（請修正回傳格式）";
      return;
    }

    // ✅ token：mock/真API都可以留著（真實 JWT 時會用到）
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");

    // ✅ 寫入 Pinia（有 setSession 就用）
    if (typeof user.setSession === "function") {
      user.setSession({ token, user: u });
    } else {
      user.isLoggedIn = true;
      user.isAdmin = !!u.isAdmin;
      user.username = u.name || u.username || String(u.id || username.value);
      if ("profile" in user) user.profile = u;
    }

    // ✅ 關閉 modal + 導頁
    close(true); // ✅ 強制關閉（不受 isLoading 阻擋）
    if (u.isAdmin) router.push("/admin");
    else router.push("/courses");
  } catch (e) {
    errorMsg.value = USE_MOCK_LOGIN
      ? "假登入發生錯誤（請檢查 mockLogin 實作）"
      : "登入連線失敗（請確認後端 API 是否啟動 / 代理設定）";
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* 你原本 style 全保留（我只補了 p3-alert 的基本樣式，如果你原本已有可刪） */

.p3-alert{
  display:flex;
  align-items:center;
  gap:10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 83, 83, 0.12);
  border: 1px solid rgba(255, 83, 83, 0.28);
  color: rgba(255, 220, 220, 0.95);
  font-weight: 800;
  letter-spacing: .02em;
}

/* === 以下是你原本的 style（原封不動保留）=== */
.p3-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(10, 20, 40, 0.65);
  backdrop-filter: blur(12px);
  z-index: 100;
  animation: fadeIn 0.2s ease-out;
}

.p3-modal-card {
  width: min(520px, 94vw);
  padding: 28px;
  background: linear-gradient(145deg, rgba(30, 45, 70, 0.9), rgba(20, 30, 50, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    inset 0 0 30px rgba(47, 230, 255, 0.05);
}

.p3-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.p3-modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-text {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.p3-modal-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(47, 230, 255, 0.15);
  color: #2fe6ff;
  border: 1px solid rgba(47, 230, 255, 0.4);
  box-shadow: 0 0 10px rgba(47, 230, 255, 0.2);
}

.p3-x {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 20px;
  cursor: pointer;
  transition: 0.2s;
}
.p3-x:hover { color: #fff; transform: scale(1.1); }

.p3-select-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 480px) { .p3-select-grid { grid-template-columns: 1fr; } }

.p3-role-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px 16px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.p3-role-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.06);
}

.role-student:hover {
  border-color: rgba(47, 230, 255, 0.6);
  box-shadow: 0 10px 40px rgba(47, 230, 255, 0.15);
}

.role-admin:hover {
  border-color: rgba(47, 230, 255, 0.6);
  box-shadow: 0 10px 40px rgba(47, 230, 255, 0.15);
}

.p3-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.p3-role-emoji {
  font-size: 48px;
  z-index: 2;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
}

.p3-glow-orb {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  filter: blur(20px);
  opacity: 0.4;
  transition: opacity 0.3s;
}

.cyan { background: radial-gradient(circle, #2fe6ff 0%, transparent 70%); }
.gold { background: radial-gradient(circle, #ffbe0b 0%, transparent 70%); }

.p3-role-card:hover .p3-role-emoji { transform: scale(1.2) rotate(5deg); }
.p3-role-card:hover .p3-glow-orb { opacity: 0.8; filter: blur(15px); }

.p3-role-info { text-align: center; z-index: 2; }
.p3-role-title { font-size: 18px; font-weight: 900; letter-spacing: 0.05em; color: #fff; margin-bottom: 4px; }
.p3-role-sub { font-size: 12px; color: rgba(234, 242, 255, 0.6); }

.p3-row { grid-column: 1 / -1; margin-top: 8px; }
.w-full { width: 100%; }

.p3-form { display: flex; flex-direction: column; gap: 12px; }
.p3-form-head { text-align: center; margin-bottom: 10px; }
.p3-form-kicker { font-size: 11px; letter-spacing: 0.2em; color: #2fe6ff; opacity: 0.8; margin-bottom: 4px; }
.p3-form-title { font-size: 22px; font-weight: 900; color: #fff; }
.p3-label { font-size: 13px; font-weight: 600; color: rgba(255, 255, 255, 0.8); margin-left: 4px; }
.p3-label.mt { margin-top: 8px; }

.card-shine {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  transform: skewX(-20deg);
  transition: 0.5s;
  pointer-events: none;
}
.p3-role-card:hover .card-shine { left: 150%; transition: 0.7s ease-in-out; }

.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.p3-actions { display:flex; gap: 12px; margin-top: 20px; }
.p3-actions .p3-btn { flex: 1; }
</style>
