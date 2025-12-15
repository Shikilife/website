<template>
  <div class="p3-admin-page">

    <!-- ✅ 可選：如果你想讓學生看到一個禁止提示，而不是直接被踢走 -->
    <!-- 但我下面預設是直接 router.replace("/")，所以通常不會看到這段 -->
    <div v-if="!user.isAdmin" class="p3-card p3-deny">
      <h2 class="p3-deny-title">⛔ 無權限</h2>
      <p class="p3-deny-desc">這是管理者功能頁面，請使用管理者帳號登入。</p>
      <button class="p3-btn p3-btn-primary" @click="goHome">
        <span class="btn-content">回首頁</span>
      </button>
    </div>

    <!-- ✅ 只有管理者才顯示真正內容 -->
    <template v-else>
      <!-- Tabs -->
      <div class="p3-admin-tabs">
        <button
          class="p3-admin-tab"
          :class="{ active: activeTab === 'import' }"
          @click="activeTab = 'import'"
        >
          匯入資料
        </button>

        <button
          class="p3-admin-tab"
          :class="{ active: activeTab === 'course' }"
          @click="activeTab = 'course'"
        >
          管理課程
        </button>

        <button
          class="p3-admin-tab"
          :class="{ active: activeTab === 'account' }"
          @click="activeTab = 'account'"
        >
          管理帳號
        </button>
      </div>

      <!-- Content -->
      <div class="p3-admin-body">
        <div v-if="activeTab === 'import'" class="p3-card">
          <ImportData />
        </div>

        <div v-if="activeTab === 'course'" class="p3-card">
          <CourseManagement />
        </div>

        <div v-if="activeTab === 'account'" class="p3-card">
          <AccountManagement />
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

import ImportData from "@/views/admin/ImportData.vue";
import CourseManagement from "@/views/admin/CourseManagement.vue";
import AccountManagement from "@/views/admin/AccountManagement.vue";

const router = useRouter();
const user = useUserStore();

const activeTab = ref("import");

function goHome() {
  router.replace("/");
}

/**
 * ✅ 雙保險：只要不是 admin，就導回首頁
 * - onMounted：一進頁面就檢查
 * - watch：如果登入狀態/角色被改，也能即時踢走（避免狀態切換後殘留）
 */
function guardAdmin() {
  // 未登入或不是管理員，都不該停留在這頁
  if (!user.isLoggedIn || !user.isAdmin) {
    router.replace("/");
  }
}

onMounted(guardAdmin);

watch(
  () => [user.isLoggedIn, user.isAdmin],
  () => guardAdmin(),
  { deep: true }
);
</script>

<style scoped>
.p3-admin-page{
  max-width: 1180px;
  margin: 0 auto;
  padding: clamp(16px, 2.6vw, 28px);
}

.p3-admin-tabs{
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(14px);
}

/* tabs 本體：沿用你 skew 的 Persona 風格 */
.p3-admin-tab{
  flex: 1;
  padding: 12px 14px;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.04);
  color: rgba(234,242,255,0.86);
  font-weight: 900;
  letter-spacing: 0.08em;
  cursor: pointer;
  transform: skewX(-12deg);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.p3-admin-tab::selection{ background: transparent; }

.p3-admin-tab:hover{
  border-color: var(--p3-neon2);
  box-shadow: 0 0 15px rgba(148, 123, 255, 0.35);
  transform: skewX(-12deg) translateY(-1px);
}

/* Active：亮起來 */
.p3-admin-tab.active{
  background: var(--p3-neon);
  color: #061224;
  border-color: rgba(47, 230, 255, 0.65);
  box-shadow: 0 0 22px rgba(47, 230, 255, 0.35);
}

/* 內容區距離 */
.p3-admin-body{
  margin-top: 16px;
}

/* ✅ 可選：禁止提示樣式 */
.p3-deny{
  margin-top: 16px;
  text-align: center;
}
.p3-deny-title{
  font-size: 20px;
  font-weight: 900;
  margin: 0 0 10px;
}
.p3-deny-desc{
  margin: 0 0 16px;
  color: rgba(234,242,255,0.75);
}
</style>
