<template>
  <div class="fixed inset-0 bg-black/50 flex justify-center items-center">
    <div class="w-[480px] bg-white rounded-xl p-10 shadow-xl">

      <h1 class="text-3xl font-bold text-center mb-10">
        系統管理員登入
      </h1>

      <div class="mb-6">
        <label class="text-lg">帳號：</label>
        <input v-model="account" class="w-full border px-4 py-3 rounded-lg" />
      </div>

      <div class="mb-8">
        <label class="text-lg">密碼：</label>
        <input v-model="password" type="password" class="w-full border px-4 py-3 rounded-lg" />
      </div>

      <button
        @click="login"
        class="w-full bg-[#4B6587] text-white text-xl py-3 rounded-lg"
      >
        登入
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { accounts } from "@/data/accounts";   // 你說你的檔案叫 accounts.js

// 必須有 defineEmits
const emit = defineEmits(["close"]);

const router = useRouter();
const user = useUserStore();

const account = ref("");
const password = ref("");

function login() {
  // 由 accounts 找對應帳號
  const admin = accounts.find(
    (a) => a.account === account.value && a.password === password.value
  );

  if (!admin) {
    alert("帳號或密碼錯誤！");
    return;
  }

  // 正常登入
  user.loginAdmin(admin.name);

  // 關閉彈窗
  emit("close");

  // 跳轉管理員首頁
  router.push("/admin");
}
</script>
