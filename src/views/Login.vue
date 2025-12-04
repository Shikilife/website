
<template>
  <div class="w-screen h-screen bg-[#F2F2F2] flex justify-center items-center">
    <div class="w-[480px] bg-white rounded-2xl shadow-xl p-10">

      <!-- Title -->
      <h1 class="text-3xl font-bold text-center text-[#2B2B2B] mb-10">
        系統管理員登入
      </h1>

      <!-- Error Message -->
      <div
        v-if="error"
        class="w-full bg-red-100 border border-red-300 text-red-600 px-4 py-3 rounded-lg mb-6 text-center"
      >
        帳號或密碼錯誤
      </div>

      <!-- Username -->
      <div class="mb-6">
        <label class="block text-lg mb-2 text-gray-700">帳號</label>
        <input
          v-model="username"
          type="text"
          class="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="請輸入帳號"
        />
      </div>

      <!-- Password -->
      <div class="mb-8">
        <label class="block text-lg mb-2 text-gray-700">密碼</label>
        <input
          v-model="password"
          type="password"
          class="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="請輸入密碼"
        />
      </div>

      <!-- Login Button -->
      <button
        @click="handleLogin"
        class="w-full py-3 bg-[#4B6587] text-white text-xl rounded-lg shadow hover:bg-[#3d546f] transition"
      >
        登入
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// login fields
const username = ref("");
const password = ref("");
const error = ref(false);

// 偽登入帳密（你可之後改成 API）
const correctAccount = "admin";
const correctPassword = "1234";

const handleLogin = () => {
  if (username.value === correctAccount && password.value === correctPassword) {
    error.value = false;
    router.push("/admin"); // 跳轉到首頁
  } else {
    error.value = true;
  }
};
</script>
