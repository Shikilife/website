<template>
  <div
    class="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg text-black z-50"
  >
    <button
      class="w-full text-left px-4 py-3 hover:bg-gray-100"
      @click="go('/Profile')"
    >
      個人資訊
    </button>

    <button
      class="w-full text-left px-4 py-3 hover:bg-gray-100"
      @click="go('/CourseTable')"
    >
      課表
    </button>

    <button
      class="w-full text-left px-4 py-3 hover:bg-gray-100"
      @click="go('/favorites')"
    >
      我的收藏
    </button>

    <button
      class="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100"
      @click="logoutUser"
    >
      登出
    </button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const user = useUserStore();

const emit = defineEmits(["close"]);

// 導頁
function go(path) {
  router.push(path);
  emit("close");
}

// 登出
function logoutUser() {
  user.isLoggedIn = false;
  user.username = "";
  emit("close");
  router.push("/");
}
</script>
