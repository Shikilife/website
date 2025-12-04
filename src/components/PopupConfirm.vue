<template>
  <div class="fixed inset-0 bg-black/50 flex justify-center items-center">

    <div class="bg-white rounded-xl shadow-xl w-[400px] p-8 text-center">

      <h2 class="text-2xl font-bold mb-6">確認刪除？</h2>

      <p class="text-lg mb-8">
        你確定要刪除帳號「{{ target.username }}」嗎？
      </p>

      <div class="flex justify-center gap-6">
        <button
          class="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
          @click="$emit('cancel')"
        >
          取消
        </button>

        <button
          class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
          @click="$emit('confirm')"
        >
          刪除
        </button>
      </div>

    </div>

  </div>
</template>

<script setup>
defineProps({
  target: { type: Object, required: true }
})
</script>
