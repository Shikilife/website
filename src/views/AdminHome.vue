<template>
  <div class="w-full min-h-screen bg-white">

    <!-- 🔵 上方 Tab -->
    <div class="flex w-full bg-[#4B6587] text-white text-xl">
      <div
        class="flex-1 text-center py-4 cursor-pointer"
        :class="activeTab === 'import' ? 'bg-[#3a4f6d]' : ''"
        @click="activeTab = 'import'"
      >
        匯入資料
      </div>

      <div
        class="flex-1 text-center py-4 cursor-pointer"
        :class="activeTab === 'course' ? 'bg-[#3a4f6d]' : ''"
        @click="activeTab = 'course'"
      >
        管理課程
      </div>

      <div
        class="flex-1 text-center py-4 cursor-pointer"
        :class="activeTab === 'account' ? 'bg-[#3a4f6d]' : ''"
        @click="activeTab = 'account'"
      >
        管理帳號
      </div>
    </div>


    <!-- ============================= -->
    <!-- 📌 下方內容（不跳頁） -->
    <!-- ============================= -->

    <div v-if="activeTab === 'import'" class="p-10">
      <ImportData />
    </div>

    <div v-if="activeTab === 'course'" class="p-10">
      <CourseManagement />
    </div>

    <div v-if="activeTab === 'account'" class="p-10">
      <AccountManagement />
    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";

const activeTab = ref("import");

import ImportData from "@/views/admin/ImportData.vue";
import CourseManagement from "@/views/admin/CourseManagement.vue";
import AccountManagement from "@/views/admin/AccountManagement.vue";
</script>
