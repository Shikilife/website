<template>
  <div class="w-screen min-h-screen bg-white">

    <!-- 🔵 上方 Header（新版） -->
    <header class="w-full bg-[#4B6587] text-white py-4 px-8 flex justify-between items-center shadow-md">

      <!-- 左側 Logo + Title -->
      <div class="flex items-center gap-4">
        <img src="/logo.png" alt="logo" class="w-14 h-14" />

        <div class="leading-tight">
          <h1 class="text-2xl font-bold">
            國立臺北護理健康大學 課程查詢系統
          </h1>
          <p class="text-sm opacity-80">
            National Taipei University of Nursing and Health Sciences Course inquiry system
          </p>
        </div>
      </div>

      <!-- 右上（未登入 → 登入按鈕） -->
      <button
        v-if="!user.isLoggedIn"
        @click="showLoginSelect = true"
        class="bg-white text-[#4B6587] font-bold px-6 py-2 rounded-lg shadow hover:bg-gray-100"
      >
        登入
      </button>

      <!-- 右上（已登入 → 帳號選單） -->
      <div v-else class="relative">
        <button @click="toggleUserMenu" class="text-lg font-bold">
          {{ user.username }}
        </button>

        <!-- 下拉選單 -->
        <UserMenu v-if="userMenuOpen" @close="userMenuOpen = false" />
      </div>
    </header>

    <!-- 📌 Router Page -->
    <router-view />

    <!-- 📌 登入 popup -->
    <LoginSelect
      v-if="showLoginSelect"
      @close="showLoginSelect = false"
      @student="openStudentLogin"
      @admin="openAdminLogin"
    />

    <LoginStudent
      v-if="showStudentLogin"
      @close="showStudentLogin = false"
    />

    <LoginAdmin
      v-if="showAdminLogin"
      @close="showAdminLogin = false"
    />

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import LoginSelect from "@/components/LoginSelect.vue";
import LoginStudent from "@/components/LoginStudent.vue";
import LoginAdmin from "@/components/LoginAdmin.vue";
import UserMenu from "@/components/UserMenu.vue";

const user = useUserStore();

// 彈窗控制
const showLoginSelect = ref(false);
const showStudentLogin = ref(false);
const showAdminLogin = ref(false);

// 下拉選單
const userMenuOpen = ref(false);
function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value;
}

// 選擇學生登入
function openStudentLogin() {
  showLoginSelect.value = false;
  showStudentLogin.value = true;
}

// 選擇管理員登入
function openAdminLogin() {
  showLoginSelect.value = false;
  showAdminLogin.value = true;
}
</script>

<style scoped>
</style>
