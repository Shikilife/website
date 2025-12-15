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

      <div v-else class="p3-form fade-in">
        <div class="p3-form-head">
          <div class="p3-form-kicker">{{ step === 'student' ? 'STUDENT' : 'ADMIN' }} LOGIN</div>
          <div class="p3-form-title">{{ step === 'student' ? '學生登入' : '管理者登入' }}</div>
        </div>

        <div v-if="error" class="p3-alert">
          <span>⚠️</span> 帳號或密碼錯誤
        </div>

        <label class="p3-label">{{ step === 'student' ? '學號 / 帳號' : '帳號' }}</label>
        <input v-model="username" class="p3-input" :placeholder="step === 'student' ? '例如：122214217' : '例如：admin'" @keyup.enter="handleLogin" />

        <label class="p3-label mt">密碼</label>
        <input v-model="password" type="password" class="p3-input" placeholder="請輸入密碼" @keyup.enter="handleLogin" />

        <div class="p3-actions">
          <button class="p3-btn p3-btn-primary" @click="handleLogin">
            <span class="btn-content">登入</span>
            <div class="btn-shine"></div>
          </button>

          <button class="p3-btn p3-btn-ghost" @click="back">
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
import { useUserStore } from "@/stores/user";
import { accounts } from "@/data/accounts"; 

const emit = defineEmits(["close"]);
const router = useRouter();
const user = useUserStore();

const step = ref("select");
const username = ref("");
const password = ref("");
const error = ref(false);

function resetFields() {
  username.value = "";
  password.value = "";
  error.value = false;
}

function close() {
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

// 合併登入邏輯，依據 step 判斷
function handleLogin() {
  const acc = accounts.find(
    (a) => a.username === username.value && a.password === password.value
  );

  if (!acc) {
    error.value = true;
    return;
  }

  // step: 'student' | 'admin'
  if (step.value === "student") {
    // ✅ 學生登入：禁止管理員帳號走學生登入
    if (acc.role === "管理員") {
      error.value = true;
      return;
    }

    user.loginStudent(acc.name || acc.username); // ✅ 用 action
    close();
    router.push("/"); // or "/courses"
    return;
  }

  if (step.value === "admin") {
    // ✅ 管理員登入：只允許管理員
    if (acc.role !== "管理員") {
      error.value = true;
      return;
    }

    user.loginAdmin(acc.name || acc.username); // ✅ 用 action
    close();
    router.push("/admin");
    return;
  }

  // 保險：不應該進來
  error.value = true;
}

</script>

<style scoped>
/* 1. Modal 背景：更透、更亮 */
.p3-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(10, 20, 40, 0.65); /* 降低不透明度 */
  backdrop-filter: blur(12px); /* 增加模糊感 */
  z-index: 100;
  animation: fadeIn 0.2s ease-out;
}

/* 2. Modal 卡片：琉璃質感 */
.p3-modal-card {
  width: min(520px, 94vw);
  padding: 28px;
  /* 背景調亮，帶藍色調 */
  background: linear-gradient(145deg, rgba(30, 45, 70, 0.9), rgba(20, 30, 50, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.3); /* 頂部高光 */
  border-radius: 20px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5), 
    inset 0 0 30px rgba(47, 230, 255, 0.05); /* 內部微微發光 */
}

/* Header */
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

/* 3. 角色卡片：更炫炮的設計 */
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
  align-items: center; /* 置中 Icon */
  gap: 16px;
}

/* Hover 效果：整體變亮 + 邊框發光 */
.p3-role-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.06);
}

/* 學生卡 Hover 特效 (Cyan) */
.role-student:hover {
  border-color: rgba(47, 230, 255, 0.6);
  box-shadow: 0 10px 40px rgba(47, 230, 255, 0.15);
}

/* 管理員卡 Hover 特效 (Gold) */
.role-admin:hover {
  border-color: rgba(47, 230, 255, 0.6);
  box-shadow: 0 10px 40px rgba(47, 230, 255, 0.15);}

/* 4. Icon 系統：全息投影光球 */
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
  /* 讓 Emoji 也有發光感 */
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
}

/* 能量光球 (背景暈光) */
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

/* Hover 時 Icon 放大 + 光球變亮 */
.p3-role-card:hover .p3-role-emoji { transform: scale(1.2) rotate(5deg); }
.p3-role-card:hover .p3-glow-orb { opacity: 0.8; filter: blur(15px); }

/* 文字區塊 */
.p3-role-info { text-align: center; z-index: 2; }
.p3-role-title { font-size: 18px; font-weight: 900; letter-spacing: 0.05em; color: #fff; margin-bottom: 4px; }
.p3-role-sub { font-size: 12px; color: rgba(234, 242, 255, 0.6); }

/* 通用 Layout */
.p3-row { grid-column: 1 / -1; margin-top: 8px; }
.w-full { width: 100%; }

/* Form 樣式繼承微調 */
.p3-form { display: flex; flex-direction: column; gap: 12px; }
.p3-form-head { text-align: center; margin-bottom: 10px; }
.p3-form-kicker { font-size: 11px; letter-spacing: 0.2em; color: #2fe6ff; opacity: 0.8; margin-bottom: 4px; }
.p3-form-title { font-size: 22px; font-weight: 900; color: #fff; }
.p3-label { font-size: 13px; font-weight: 600; color: rgba(255, 255, 255, 0.8); margin-left: 4px; }
.p3-label.mt { margin-top: 8px; }

/* 掃光動畫 (Card Shine) */
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

/* 動畫 */
.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.p3-actions { display:flex; gap: 12px; margin-top: 20px; }
.p3-actions .p3-btn { flex: 1; }
</style>