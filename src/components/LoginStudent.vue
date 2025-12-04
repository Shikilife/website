<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="bg-white w-[420px] rounded-2xl shadow-xl p-8">
      <!-- 標題 -->
      <h2 class="text-2xl font-bold text-center mb-6">北護課程查詢管理系統</h2>

      <p class="text-center text-gray-600 mb-6">請登入以查詢及選擇課程</p>

      <!-- 帳號 -->
      <div class="mb-4">
        <label class="text-gray-700 block mb-2">帳號/學號：</label>
        <input
          v-model="username"
          type="text"
          class="w-full border rounded-lg px-4 py-2 bg-gray-100"
          placeholder="請輸入帳號"
        />
      </div>

      <!-- 密碼 -->
      <div class="mb-6">
        <label class="text-gray-700 block mb-2">密碼：</label>
        <input
          v-model="password"
          type="password"
          class="w-full border rounded-lg px-4 py-2 bg-gray-100"
          placeholder="請輸入密碼"
        />
      </div>

      <!-- 錯誤訊息 -->
      <p v-if="error" class="text-red-500 text-center mb-4">
        帳號或密碼錯誤
      </p>

      <!-- 下一步按鈕 -->
      <button
        @click="handleLogin"
        class="w-full bg-[#1BA4E5] text-white py-3 rounded-xl text-lg font-bold"
      >
        下一步
      </button>

      <!-- 取消 -->
      <button
        @click="$emit('close')"
        class="w-full mt-3 text-gray-500 text-center"
      >
        取消
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const user = useUserStore();
const emit = defineEmits(["close"]);

const username = ref("");
const password = ref("");
const error = ref(false);

// 模擬帳號資料
const accounts = [
  { username: "admin", password: "admin", role: "管理員" },
  { username: "1234", password: "1234", role: "學生" },
  { username: "t8765432", password: "5678", role: "學生" },
];

function handleLogin() {
  const acc = accounts.find(
    (a) => a.username === username.value && a.password === password.value
  );

  // ❌ 錯誤 → 不關閉彈窗
  if (!acc) {
    error.value = true;
    return;
  }

  // ✔ 成功登入
  user.isLoggedIn = true;
  user.username = acc.username;
  user.role = acc.role;
  error.value = false;

  // 管理員導向
  if (acc.role === "管理員") {
    router.push("/admin");
  } else {
    router.push("/");
  }

  // ✔ 成功後才關閉 Login 視窗
  emit("close");
}
</script>
