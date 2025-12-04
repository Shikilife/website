<template>
  <div class="w-[240px] bg-[#4B6587] text-white flex flex-col p-6">

    <!-- Title -->
    <h2 class="text-2xl font-bold mb-10">系統管理員</h2>

    <!-- Menu buttons -->
    <button
      @click="$emit('switchPage', 'account')"
      class="text-left w-full py-3 px-4 mb-4 rounded-lg hover:bg-[#3b4f6a] transition"
    >
      管理帳號
    </button>

    <button
      disabled
      class="text-left w-full py-3 px-4 mb-4 rounded-lg opacity-40 cursor-not-allowed"
    >
      管理課程（尚未啟用）
    </button>

    <div class="flex-1"></div>

    <!-- Logout -->
    <button
      @click="$emit('logout')"
      class="text-left w-full py-3 px-4 mt-auto bg-red-500 hover:bg-red-600 rounded-lg"
    >
      登出
    </button>

  </div>
</template>

<script setup>
</script>
