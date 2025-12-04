<template>
  <div class="fixed inset-0 bg-black/50 flex justify-center items-center">
    <div class="bg-white p-10 rounded-xl w-[480px] text-center shadow-lg">

      <h2 class="text-2xl font-bold mb-8">請選擇身份</h2>

      <div class="flex justify-between mb-8">
        <!-- 學生 -->
        <button
          @click="$emit('student')"
          class="w-[45%] bg-gray-200 rounded-xl p-6 text-xl"
        >
          <div class="text-3xl mb-3">👤</div>
          學生
        </button>

        <!-- 管理員 -->
        <button
          @click="$emit('admin')"
          class="w-[45%] bg-gray-200 rounded-xl p-6 text-xl"
        >
          <div class="text-3xl mb-3">🧑‍💼</div>
          管理員
        </button>
      </div>

      <button
        @click="$emit('close')"
        class="mt-4 text-gray-500"
      >
        取消
      </button>
    </div>
  </div>
</template>
