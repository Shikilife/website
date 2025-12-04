<template>
  <div class="flex h-screen bg-gray-100">

    <!-- Sidebar -->
    <Sidebar @logout="logout" @switchPage="backToHome" />

    <div class="flex-1 p-10">

      <h1 class="text-3xl font-bold mb-8">
        {{ isNew ? "新增帳號" : "修改帳號" }}
      </h1>

      <!-- Form -->
      <div class="bg-white p-8 rounded-xl shadow w-[600px]">

        <!-- Username -->
        <div class="mb-6">
          <label class="block text-lg mb-2">帳號</label>
          <input
            v-model="form.username"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
          />
        </div>

        <!-- Role -->
        <div class="mb-8">
          <label class="block text-lg mb-2">身分</label>
          <select
            v-model="form.role"
            class="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
          >
            <option>老師</option>
            <option>行政</option>
            <option>管理員</option>
          </select>
        </div>

        <!-- Buttons -->
        <div class="flex gap-4">
          <button
            class="bg-[#4B6587] text-white px-6 py-3 rounded-lg text-lg hover:bg-[#3d546f]"
            @click="save"
          >
            {{ isNew ? "新增" : "儲存" }}
          </button>

          <button
            v-if="!isNew"
            class="bg-red-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-red-600"
            @click="confirmDelete"
          >
            刪除
          </button>
        </div>
      </div>
    </div>

    <!-- Popups -->
    <PopupSuccess
      v-if="showSuccess"
      :message="successMessage"
      @close="closeSuccess"
    />

    <PopupConfirm
      v-if="showDelete"
      :target="form"
      @cancel="showDelete = false"
      @confirm="deleteAccount"
    />

  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import accounts from "@/data/accounts.js";
import Sidebar from "@/components/Sidebar.vue";
import PopupSuccess from "@/components/PopupSuccess.vue";
import PopupConfirm from "@/components/PopupConfirm.vue";

const router = useRouter();
const route = useRoute();

const id = route.params.id;
const isNew = id === "new";

const form = ref(
  isNew
    ? { username: "", role: "老師" }
    : accounts.find((a) => a.id == id)
);

// success popup
const showSuccess = ref(false);
const successMessage = ref("");

// delete popup
const showDelete = ref(false);

// 儲存資料
const save = () => {
  showSuccess.value = true;
  successMessage.value = isNew ? "新增成功！" : "修改成功！";
};

// 刪除
const confirmDelete = () => {
  showDelete.value = true;
};

const deleteAccount = () => {
  showDelete.value = false;
  showSuccess.value = true;
  successMessage.value = "刪除成功！";
};

// 關閉成功提示
const closeSuccess = () => {
  showSuccess.value = false;
  router.push("/admin");
};

// 左側切換回首頁
const backToHome = () => {
  router.push("/admin");
};

// 登出
const logout = () => {
  router.push("/login");
};
</script>
