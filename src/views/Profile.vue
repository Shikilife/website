<template>
  <main class="p3-page">
    <section class="p3-card profile-card">
      <!-- Header -->
      <header class="profile-head">
        <div class="profile-head-left">
          <div class="profile-badge">
            <span class="profile-badge-dot"></span>
            {{ roleText }} · Profile
          </div>

          <h1 class="p3-h2 profile-title">個人資訊</h1>
          <p class="profile-sub">
            目前為展示版（Demo），後續串 API 後會自動帶入完整資料。
          </p>

          <!-- ✅ 返回按鈕（桌機） -->
          <div class="profile-actions">
            <button class="p3-btn p3-btn-ghost profile-btn" @click="goBack">
              ← 返回上一頁
            </button>
            <button class="p3-btn p3-btn-primary profile-btn" @click="goCourses">
              回課程查詢
            </button>
          </div>
        </div>

        <!-- ✅ 右上：顯示完整姓名 + avatar -->
        <div class="profile-head-right">
          <div class="profile-userbox" :title="displayName">
            <div class="profile-avatar" aria-hidden="true">
              <span>{{ avatarText }}</span>
            </div>
            <div class="profile-usertext">
              <div class="profile-username">{{ displayName }}</div>
              <div class="profile-role">{{ roleText }}</div>
            </div>
          </div>
        </div>
      </header>

      <!-- Table -->
      <div class="profile-table-wrap">
        <table class="profile-table">
          <thead>
            <tr>
              <th>{{ idLabel }}</th>
              <th>性別</th>
              <th>姓名</th>
              <th>班級</th>
              <th>電話</th>
              <th>地址</th>
              <th>mail</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td class="mono">{{ idValue }}</td>
              <td>{{ genderText }}</td>
              <td class="strong">{{ displayName }}</td>
              <td>{{ classText }}</td>
              <td class="mono">{{ phoneText }}</td>
              <td class="truncate" :title="addressText">{{ addressText }}</td>
              <td class="mono truncate" :title="emailText">{{ emailText }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer hint + 手機返回 -->
      <div class="profile-foot">
        <div class="profile-hint">
          Tip：之後串 API 時，只要把 store.profile 補上對應欄位，這頁不用大改 ✅
        </div>

        <!-- ✅ 返回按鈕（手機/窄螢幕會比較好按） -->
        <div class="profile-actions profile-actions-bottom">
          <button class="p3-btn p3-btn-ghost profile-btn" @click="goBack">
            ← 返回上一頁
          </button>
          <button class="p3-btn p3-btn-primary profile-btn" @click="goCourses">
            回課程查詢
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();

/**
 * ✅ 這裡假設你的 store 有：
 * - isLoggedIn
 * - isAdmin
 * - username
 * - profile（可選，之後串 API 再補）
 */
const { username, isAdmin, isLoggedIn } = storeToRefs(userStore);

// profile 可能不存在，這裡保守處理
const profile = computed(() => userStore.profile || null);

const roleText = computed(() => (isAdmin.value ? "管理者" : "學生"));
const idLabel = computed(() => (isAdmin.value ? "編號" : "學號"));

/**
 * ✅ 顯示資料優先順序：
 * 1) store.profile.name / fullName
 * 2) store.username
 * 3) "-"
 */
const displayName = computed(() => {
  const p = profile.value || {};
  const n =
    (p.name || p.fullName || p.displayName || "").toString().trim() ||
    (username.value || "").toString().trim() ||
    "-";
  return n || "-";
});

const idValue = computed(() => {
  const p = profile.value || {};
  // 管理者：可用 id / adminId；學生：可用 studentId / username
  const v = isAdmin.value
    ? p.id ?? p.adminId ?? p.userId
    : p.studentId ?? p.id ?? username.value;
  return (v ?? "-").toString();
});

const genderText = computed(() => {
  const p = profile.value || {};
  const g = (p.gender ?? "").toString().trim().toLowerCase();
  if (!g) return "-";
  if (["m", "male", "男"].includes(g)) return "男";
  if (["f", "female", "女"].includes(g)) return "女";
  return p.gender || "-";
});

const classText = computed(() => {
  const p = profile.value || {};
  return (p.className || p.class || p.gradeClass || "-").toString().trim() || "-";
});

const phoneText = computed(() => {
  const p = profile.value || {};
  return (p.phone || p.mobile || "-").toString().trim() || "-";
});

const addressText = computed(() => {
  const p = profile.value || {};
  return (p.address || "-").toString().trim() || "-";
});

const emailText = computed(() => {
  const p = profile.value || {};
  return (p.email || p.mail || "-").toString().trim() || "-";
});

/** ✅ Avatar：中文取第一字；英文取首字母（遇到空白會跳過） */
const avatarText = computed(() => {
  const n = displayName.value;
  if (!n || n === "-") return "?";

  // 去掉前後空白，抓第一個「不是空白」的字
  const first = n.replace(/\s+/g, " ").trim().slice(0, 1);
  if (!first) return "?";
  return first.toUpperCase();
});

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push("/courses");
}

function goCourses() {
  router.push("/courses");
}

/**
 * ✅ 保護：沒登入不給看 Profile（避免訪客直接輸入網址）
 * 如果你希望訪客也能看 Demo，就把這段拿掉
 */
onMounted(() => {
  if (!isLoggedIn.value) router.replace("/courses");
});
</script>

<style scoped>
.p3-page {
  width: 100%;
  padding: clamp(18px, 3vw, 34px);
  display: flex;
  justify-content: center;
}

.profile-card {
  width: min(1180px, 100%);
}

/* Header */
.profile-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.profile-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(47, 230, 255, 0.22);
  font-weight: 800;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: rgba(234, 242, 255, 0.92);
}

.profile-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 99px;
  background: var(--p3-neon);
  box-shadow: 0 0 16px rgba(47, 230, 255, 0.7);
}

.profile-title {
  margin-top: 12px;
  margin-bottom: 8px;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0.02em;
  text-shadow: 0 0 22px rgba(47, 230, 255, 0.15);
}

.profile-sub {
  margin: 0;
  color: rgba(180, 210, 255, 0.78);
  line-height: 1.7;
  font-size: 13px;
}

/* ✅ actions */
.profile-actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.profile-btn {
  padding: 10px 16px;
  border-radius: 12px;
}

/* ✅ 右上：User box */
.profile-userbox {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 123, 255, 0.20);
  box-shadow: 0 0 22px rgba(148, 123, 255, 0.10);
  max-width: 280px;
}

.profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(47, 230, 255, 0.18);
  box-shadow: 0 0 18px rgba(47, 230, 255, 0.10);
  font-weight: 900;
  font-size: 18px;
  flex: 0 0 auto;
}

.profile-usertext {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-username {
  font-weight: 900;
  font-size: 14px;
  color: rgba(234, 242, 255, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-role {
  font-size: 12px;
  color: rgba(180, 210, 255, 0.72);
  letter-spacing: 0.08em;
}

/* Table */
.profile-table-wrap {
  margin-top: 18px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(25, 40, 70, 0.55);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.22);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.profile-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;
}

.profile-table thead tr {
  background: rgba(255, 255, 255, 0.08);
}

.profile-table th {
  text-align: left;
  padding: 14px 16px;
  font-weight: 900;
  letter-spacing: 0.06em;
  color: rgba(234, 242, 255, 0.88);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  white-space: nowrap;
}

.profile-table td {
  padding: 14px 16px;
  color: rgba(234, 242, 255, 0.92);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}

.profile-table tbody tr:hover {
  background: rgba(47, 230, 255, 0.10);
}

.strong {
  font-weight: 900;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
    monospace;
}

.truncate {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Footer */
.profile-foot {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.profile-hint {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(47, 230, 255, 0.14);
  color: rgba(180, 210, 255, 0.78);
  font-size: 12px;
}

.profile-actions-bottom {
  display: none;
}

/* Mobile */
@media (max-width: 720px) {
  .profile-head {
    flex-direction: column;
    align-items: stretch;
  }
  .profile-userbox {
    max-width: 100%;
    justify-content: flex-start;
  }
  .profile-actions {
    display: none;
  }
  .profile-actions-bottom {
    display: flex;
  }
}
</style>
